export function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "Navis Docs <no-reply@app.navisdocs.com>";
}
