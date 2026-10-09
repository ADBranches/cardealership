const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

export function createEmailVerificationMessage({ name, verificationUrl }) {
  const safeName = escapeHtml(name || "Customer");
  const safeUrl = escapeHtml(verificationUrl);
  return {
    subject: "Verify your dealership account",
    text: `Hello ${name || "Customer"}, verify your account: ${verificationUrl}`,
    html: `<p>Hello ${safeName},</p><p>Verify your dealership account using this secure link:</p><p><a href="${safeUrl}">Verify email address</a></p><p>This link expires shortly and can be used once.</p>`,
  };
}
