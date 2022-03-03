import Props from './props';

const props = new Props([
  'selection',
  'onClick',
  'className',
  'text',
]);

class Button {
  constructor() {
    props.addTo(this);
  }
  draw() {
    const { selection, className, text, onClick } = this.props();
    selection.append('span')
      .attrs({
        class: className,
      })
      .on('click', onClick)
      .text(text);
    return this;
  }
  remove() {
    const { selection, className } = this.props();
    selection.selectAll(`.${className}`).remove();
  }
}

export default Button;
