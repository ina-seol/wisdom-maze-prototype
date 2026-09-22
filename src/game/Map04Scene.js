lockInput() {

  this.inputLocked = true;
  this.interactionRunning = true;
  this.lockStartedAt = Date.now();

  if (this.player?.body) {
    this.player.body.setVelocity(0, 0);
  }

  this.prompt?.setVisible(false);
}


forceUnlock() {

  this.inputLocked = false;
  this.interactionRunning = false;
  this.lockStartedAt = 0;

  if (this.input?.keyboard) {
    this.input.keyboard.enabled = true;
  }

  if (this.player?.body) {
    this.player.body.enable = true;
    this.player.body.setVelocity(0, 0);
  }
}


recoverStuckInput() {

  if (!this.inputLocked) {
    return;
  }

  const modal =
    document.querySelector("#modal");

  const modalVisible =
    modal &&
    !modal.classList.contains("hidden");

  if (modalVisible) {
    return;
  }

  if (!this.lockStartedAt) {
    return;
  }

  if (
    Date.now() - this.lockStartedAt
    < 200
  ) {
    return;
  }

  console.warn(
    "MAP04 stuck input -> force unlock"
  );

  this.forceUnlock();
}
