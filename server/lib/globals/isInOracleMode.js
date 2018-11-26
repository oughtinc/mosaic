class GlobalVariable {
  constructor(defaultValue) {
    this.value = defaultValue;
  }

  getValue() {
    return this.value;
  }

  setValue(newValue) {
    this.value = newValue;
  }
}

const isInOracleMode = new GlobalVariable(true);

export { isInOracleMode };
