// [IMP-431] Visual inspection scenario: reveal full diorama skyline without TopBar overlay
const topbars = document.querySelectorAll('header, [data-testid="topbar-container"], .vt-top-hud');
for (let i = 0; i < topbars.length; i++) {
  topbars[i].style.display = 'none';
}
