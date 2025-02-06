module.exports = {
  name: "guildMemberAdd",
  execute(member) {
    // Set role to padawan
    member.roles.set(["726269144521244683"]);
  },
};
