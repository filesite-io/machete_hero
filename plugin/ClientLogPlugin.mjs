import { ClientPlugin } from '@ulixee/hero-plugin-utils';

class ClientLogPlugin extends ClientPlugin {

  async onHero(hero, sendToCore) {
    const logTime = (new Date()).toLocaleString('zh-CN');
    console.log('%s - New Hero is initialized, session id %s.', logTime, await hero.sessionId);
  }

  async onTab(hero, tab, sendToCore) {
    const logTime = (new Date()).toLocaleString('zh-CN');
    console.log('%s - New Tab is initialized, id %s.', logTime, await tab.tabId);
  }

  async onFrameEnvironment(hero, frameEnvironment, sendToCore) {
    const logTime = (new Date()).toLocaleString('zh-CN');
    console.log('%s - New FrameEnvironment is initialized.', logTime);
  }

}

export default ClientLogPlugin;
