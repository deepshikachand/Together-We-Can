export function buildBlogPrompt(event, driveCompletion) {
  const testimonialsText = driveCompletion.testimonials?.length
    ? driveCompletion.testimonials
        .map(t => `- “${t.comment}” (Rating: ${t.rating}/5)`)
        .join('\n')
    : 'No testimonials were submitted.';

  const highlightsText = driveCompletion.highlights?.length
    ? driveCompletion.highlights.map(h => `- ${h}`).join('\n')
    : 'No specific highlights recorded.';

  const keywordsText = driveCompletion.keywords?.join(', ') || 'community, volunteering';

  return `
You are a blog writer for a community-driven website. Write a blog post about a recent social drive titled **"${event.eventName}"**.

**Category**: ${event.category || ''}  
**Location**: ${event.location || event.fullAddress || ''}  
**Date**: ${event.startDate} to ${event.endDate}  
**Summary**: ${driveCompletion.summary}

**Highlights**:  
${highlightsText}

**Participant Feedback**:  
${testimonialsText}

**Suggested Keywords**: ${keywordsText}

Write a 300-word blog in a **warm, inspiring tone**. Highlight the community impact, acknowledge volunteers, and end with an encouraging call to action for joining future drives.
  `.trim();
} 