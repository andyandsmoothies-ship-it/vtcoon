import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export interface CommonThreeProps {
  readonly position?: readonly number[] | [number, number, number];
  readonly scale?: readonly number[] | [number, number, number];
  readonly rotation?: readonly number[] | [number, number, number];
  readonly isMobile?: boolean;
  readonly frames?: number;
  readonly children?: React.ReactNode;
  readonly [key: string]: unknown;
}

/**
 * Standard test element type extending React.ReactElement with strongly-typed props
 * eliminating type assertions or global Object interface pollution.
 */
export type TestReactElement<P = CommonThreeProps> = React.ReactElement & {
  readonly props: P & CommonThreeProps;
};

export type RenderableFunctionComponent<P> = (props: P) => React.ReactElement | null;

/**
 * Executes Component inside React's render phase without mounting real Three.js DOM,
 * capturing the topmost returned ReactElement tree for pure JSX inspection.
 */
export function captureTree<P = Record<string, unknown>>(
  Component: RenderableFunctionComponent<P>,
  props?: P
): TestReactElement<P> | null {
  if (typeof Component !== 'function') return null;

  const safeProps = (props ?? {}) as P;
  const holder: { current: React.ReactElement | null } = { current: null };
  renderToStaticMarkup(
    React.createElement(() => {
      holder.current = Component(safeProps);
      return null;
    })
  );

  const capturedNode = holder.current;
  if (capturedNode === null) {
    return null;
  }
  const capturedProps = React.isValidElement(capturedNode)
    ? (capturedNode.props as Record<string, unknown>)
    : {};

  const combinedProps = {
    ...capturedProps,
    ...safeProps,
    children: capturedNode,
  } as P & CommonThreeProps;

  return React.createElement(Component as React.ElementType, combinedProps) as TestReactElement<P>;
}

function findInArray<P>(
  items: readonly unknown[],
  predicate: (node: TestReactElement<P>) => boolean
): TestReactElement<P> | null {
  for (const item of items) {
    const found = findReactNode<P>(item as React.ReactNode, predicate);
    if (found) return found;
  }
  return null;
}

function findInChildren<P>(
  element: TestReactElement<P>,
  predicate: (node: TestReactElement<P>) => boolean
): TestReactElement<P> | null {
  const props = element.props as { children?: React.ReactNode } | undefined;
  if (!props?.children) return null;
  return findInArray(React.Children.toArray(props.children), predicate);
}

/**
 * Traverses ReactElement tree to locate matching node using standard React.Children API,
 * supporting array root fragments and nested children.
 */
export function findReactNode<P = CommonThreeProps>(
  root: React.ReactNode,
  predicate: (node: TestReactElement<P>) => boolean
): TestReactElement<P> | null {
  if (!root || typeof root === 'boolean' || typeof root === 'number' || typeof root === 'string') {
    return null;
  }
  if (Array.isArray(root)) {
    return findInArray<P>(root, predicate);
  }
  if (!React.isValidElement(root)) {
    return null;
  }
  const element = root as TestReactElement<P>;
  if (predicate(element)) {
    return element;
  }
  return findInChildren<P>(element, predicate);
}

function collectNodes<P>(
  node: React.ReactNode,
  predicate: (node: TestReactElement<P>) => boolean,
  matches: Array<TestReactElement<P>>
): void {
  if (!node || typeof node === 'boolean' || typeof node === 'number' || typeof node === 'string') {
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      collectNodes(item as React.ReactNode, predicate, matches);
    }
    return;
  }
  if (!React.isValidElement(node)) return;

  const element = node as TestReactElement<P>;
  if (predicate(element)) {
    matches.push(element);
  }
  const props = element.props as { children?: React.ReactNode } | undefined;
  if (!props?.children) return;

  for (const child of React.Children.toArray(props.children)) {
    collectNodes(child, predicate, matches);
  }
}

/**
 * Traverses ReactElement tree to collect all matching nodes matching predicate.
 */
export function findReactNodes<P = CommonThreeProps>(
  root: React.ReactNode,
  predicate: (node: TestReactElement<P>) => boolean
): Array<TestReactElement<P>> {
  const matches: Array<TestReactElement<P>> = [];
  collectNodes<P>(root, predicate, matches);
  return matches;
}

/**
 * Safely extracts props from a ReactElement or returns empty object if node is null/invalid.
 */
export function getNodeProps<P = Record<string, unknown>>(
  node: React.ReactNode
): Partial<P> & Record<string, unknown> {
  if (React.isValidElement(node)) {
    const props = node.props;
    if (props && typeof props === 'object') {
      return props as Partial<P> & Record<string, unknown>;
    }
  }
  return {};
}

/**
 * Returns JSX tag name or component name (fallback to 'Component' for anonymous functions).
 */
export function getNodeType(node: React.ReactNode): string {
  if (!React.isValidElement(node)) return '';
  const type = node.type;
  if (typeof type === 'string') return type;
  if (typeof type === 'function') {
    const fn = type as { displayName?: string; name?: string };
    return fn.displayName || fn.name || 'Component';
  }
  if (typeof type === 'object' && type !== null) {
    const obj = type as { displayName?: string; name?: string };
    return obj.displayName || obj.name || 'Component';
  }
  return 'Component';
}
