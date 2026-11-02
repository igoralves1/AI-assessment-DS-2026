// Fold-out help under each question: why it is asked (from `captures`) and how to answer (by type,
// or from an optional `help` field on the question).
export function howToAnswer(q) {
  if (q.help) return q.help
  switch (q.type) {
    case 'scale':
      return q.noDK
        ? 'Choose the level that best describes you today.'
        : `Choose the level that best describes the situation today, not plans for the future. If you hesitate between two levels, choose the lower one. Level 4 means: "${q.options[3].l}". Use "Don't know / Not applicable" rather than guessing.`
    case 'single':
      return q.other ? 'Choose one option. If none fits, choose "Other" and describe it.' : 'Choose the one option that fits best.'
    case 'multi':
      return `${q.max ? `Select up to ${q.max} options` : 'Select every option that applies'}. If none applies, choose the "None" option.${q.other ? ' You can add anything missing in the text box.' : ''}`
    case 'number':
      return `Enter your best estimate${q.unit ? ` (${q.unit})` : ''}. Approximate numbers are fine; enter 0 if there are none.`
    case 'hours':
      return q.unit && q.unit.startsWith('hours')
        ? `Enter ${q.unit} for each row. Include lectures, hands-on sessions and assignments; enter 0 when a topic is not taught.`
        : `Enter the number of ${q.unit || 'units'} for each row; enter 0 when there are none.`
    case 'grid':
      return 'For each row choose Yes (fully in place), Partial (in place but incomplete or not always applied) or No. Use "Don\'t know" if you are not sure.'
    case 'repeat':
      return 'Fill one row per item, starting with the most important. Leave unused rows empty.'
    case 'textarea':
      return 'A few sentences are enough. Concrete examples help most.'
    default:
      return 'Write a short answer.'
  }
}
