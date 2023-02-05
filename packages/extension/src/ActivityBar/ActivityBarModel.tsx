export class ActivityBarModel {
  static modelName = 'prototype';

  word = 'aaa';
  list = ['we', 'fggf', 'wewe', 'ffff,', 'grtrt'];
  demo = {
    text: <div>www</div>
  }

  say() {
    console.log('say 111');
    this.word = 'bbb'
    this.demo.text = <div>问我</div>
    setTimeout(() => {
      this.change()
    }, 3000)

  }

  change() {
    this.word = 'ccc';
    this.list.splice(0, 1)
    console.log('say 222');
  }
}