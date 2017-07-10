import React, { Component } from 'react';
import './App.css';
import MainContent from './MainContent.js';
import SideBar from './SideBar.js';
import TopBar from './TopBar.js';
import InnerMenuBar from './InnerMenuBar.js';

import { tween } from 'shifty';

class App extends Component {
  constructor() {
    super();
    this.state = { 
      mainMenu: { scalar: 0, open: false, locked: false },
      subMenu: { scalar: 0, open: false, locked: false }
    };
  }

  toggleMenuTween(menuKey, forceOpen, cb) {
    let nowOpen = !this.state[menuKey].open;
    if (typeof(forceOpen) === 'boolean') nowOpen = forceOpen;

    const setMenuState =  (newState) => this.setState({
        [menuKey]: Object.assign({}, this.state[menuKey], newState)
    });

    const baseMenuState = { open: nowOpen, locked: true };
    tween({
      from: { value: this.state[menuKey].scalar },
      to: { value: (nowOpen ? 1 : 0) },
      duration: 500,
      easing: "easeOutQuad",
      step: (newState) => setMenuState(Object.assign({}, baseMenuState, { scalar: newState.value }))
    }).then(
      () => {
        if (cb && typeof(cb) === 'function') cb();
        setMenuState({ locked: false });
      }
    );
  }

  toggleMainMenu() {
    if (!this.state.mainMenu.locked) {
      if (this.state.mainMenu.open) this.toggleMenuTween('subMenu', false);
      this.toggleMenuTween('mainMenu');
    }
  }

  cycleSubMenu(menuSwitchCb) {
    if (!this.state.subMenu.locked) {
      const openNewMenu = () => {
        const reopen = menuSwitchCb();
        if (reopen) this.toggleMenuTween('subMenu', true);
      };

      if (this.state.subMenu.open) {
        this.toggleMenuTween('subMenu', false, () => {
          openNewMenu();
        });
      } else {
        openNewMenu();
      }
    }
  }

  render() {
    const { mainMenu, subMenu } = this.state;
    return (
      <div className='app-wrap'>
        <div className='side-wrap'>
          <SideBar
            onClick={() => this.toggleMainMenu()}
            menuScalar={mainMenu.scalar + subMenu.scalar}
          />
        </div>
        <div className='main-wrap'>
          <div className='topbar-row'>
            <TopBar />
          </div>
          <div
            className='maincontent-row'
            style={{ marginLeft: (-110 + (110 * mainMenu.scalar)) }}
          >
            <InnerMenuBar
              onCycleSubMenu={(menuSwitchCb) => this.cycleSubMenu(menuSwitchCb)}
              subMenuOpen={subMenu.open}
              subMenuScalar={subMenu.scalar}
            />
            <MainContent
              subMenuScalar={subMenu.scalar}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
