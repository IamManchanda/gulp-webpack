class Person {
  constructor(name) {
    this.name = name;
  }

  hello() {
    if (typeof this.name === 'string') return `Hello, I am ${this.name}!`;
    return 'Hello!';
  }
}

const harry = new Person('Harman Manchanda');
document.write(harry.hello());
