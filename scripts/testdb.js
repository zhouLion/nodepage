const { User } = require("../lib/models/User");

const user = new User();

console.time("testdb");
Array.from({length: 5000}).fill(1).forEach((_, i) => {
  user.addUser({
    username: "testdb" + i,
    password: "123123"
  })
})
console.timeEnd("testdb");

console.time("testdb-addusers");
const users = Array.from({length: 5000}).fill(1).map((_, i) => {
  return {
    username: "testdb-addusers" + i,
    password: "123123"
  }
});
user.addUsers(users);

console.timeEnd("testdb-addusers");
