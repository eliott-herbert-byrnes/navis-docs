export function Content() {
  return (
    <>
      <h2>What Navis Docs AI does</h2>
      <p>
        Navis Docs uses AI to help teams find answers in their own procedures
        and to speed up procedure creation. The AI chat inside each team answers
        questions using that team's published procedure content.
      </p>
      <p>
        Behind the scenes, procedures are split into chunks and embedded with
        OpenAI <code>text-embedding-3-small</code>. When a user asks a question,
        Navis Docs performs semantic search over those chunks and sends the most
        relevant context to the chat model. This retrieval-augmented generation
        workflow is commonly called RAG.
      </p>

      <h2>Provider roles</h2>
      <p>
        Navis Docs uses different AI providers for different jobs. This keeps
        search and answer generation separate.
      </p>
      <ul>
        <li>
          <strong>OpenAI</strong>: used for procedure embeddings with{" "}
          <code>text-embedding-3-small</code>
        </li>
        <li>
          <strong>Anthropic</strong>: used for AI chat and AI-assisted procedure
          import with <code>claude-haiku</code>
        </li>
      </ul>
      <p>
        Embeddings make procedure content searchable by meaning. Anthropic
        powers the conversational responses and import assistance that turn
        uploaded or pasted material into usable procedure drafts.
      </p>

      <h2>Bring your own key</h2>
      <p>
        Organization owners and admins can provide AI API keys in organization
        settings. This is the bring-your-own-key, or BYOK, model. It lets each
        organization control the key used for its AI features.
      </p>
      <p>
        Stored keys are encrypted at rest using{" "}
        <code>AI_KEY_ENCRYPTION_SECRET</code>. Navis Docs can check whether a
        key exists, but it does not expose the raw value after it has been
        saved.
      </p>

      <h2>Which key enables which feature</h2>
      <p>The required key depends on the feature you want to use.</p>
      <ul>
        <li>
          <strong>Anthropic key</strong>: enables AI chat and AI-assisted
          procedure import
        </li>
        <li>
          <strong>OpenAI key</strong>: can be stored in organization settings,
          but embeddings currently use the server environment key
        </li>
      </ul>
      <p>
        If AI chat or procedure import is unavailable, check that the
        organization has an Anthropic key configured or that the self-hosted
        environment provides one.
      </p>

      <h2>Cloud and self-hosted deployments</h2>
      <p>
        On Navis Docs cloud, each organization must provide its own Anthropic
        key before AI chat and AI-assisted import can be used. Owners and admins
        manage that key from organization settings.
      </p>
      <p>
        In self-hosted deployments, operators can set{" "}
        <code>ANTHROPIC_API_KEY</code> in the environment instead. When the
        server environment provides the key, users do not need to configure BYOK
        inside the organization. For deployment setup, see{" "}
        <a href="/docs/getting-started-self-hosting">
          Getting Started with Self Hosting
        </a>
        .
      </p>

      <h2>Managing saved keys</h2>
      <p>
        Owners and admins can remove AI keys at any time from organization
        settings. Removing a key disables the features that depend on it until a
        valid key is added again or supplied by the self-hosted environment.
      </p>
      <p>
        The key status shown in the app comes from <code>getAiKeyStatus</code>.
        It confirms whether a key is present and usable for configuration
        checks, but it never returns the secret key value to the browser.
      </p>

      <h2>Suggested setup workflow</h2>
      <h3>1. Decide how keys will be supplied</h3>
      <p>
        Cloud organizations should use BYOK in organization settings.
        Self-hosters can choose between organization-provided keys and
        environment-level keys depending on how they want to manage secrets.
      </p>

      <h3>2. Add the Anthropic key</h3>
      <p>
        Add an Anthropic key first if you want AI chat or AI-assisted procedure
        import. These are the user-facing AI features most teams enable.
      </p>

      <h3>3. Confirm AI availability</h3>
      <p>
        Open a team with published procedures and try the AI chat. Good answers
        depend on clear, published procedure content because the chat searches
        the team's procedure chunks before responding.
      </p>

      <h3>4. Rotate or remove keys when needed</h3>
      <p>
        If a key is rotated at the provider, update it in Navis Docs. If your
        organization stops using AI features, remove the saved key from
        organization settings.
      </p>
    </>
  );
}
