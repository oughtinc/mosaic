const longComputation = () => {
  let sum = 0;
  for (let i = 0; i < 100000; i++) {
    sum += i;
  }
  return sum;
};

process.on("message", message => {
  console.log(message);
  if (message !== "stop") {
    const result = longComputation();
    process.send(result);
  } else {
    process.exit(1);
  }
});
