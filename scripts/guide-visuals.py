"""Render accessible, responsive conceptual diagrams from reviewed guide plans."""
import html

def render(plan):
    esc = html.escape
    steps = ''.join(
        '<li><span class="guide-step-number" aria-hidden="true">'+str(i+1)+'</span><span>'+esc(label)+'</span>'
        + ('<span class="guide-flow-arrow" aria-hidden="true">↓</span>' if i<len(plan['flow'])-1 else '')+'</li>'
        for i,label in enumerate(plan['flow']))
    layers = ''.join('<li><span class="guide-boundary-label">Boundary '+str(i+1)+'</span><strong>'+esc(label)+'</strong></li>' for i,label in enumerate(plan['architecture']))
    return '''<section class="guide-visuals" aria-labelledby="visual-overview"><h2 id="visual-overview">Visual overview</h2>
<p>Use the workflow to follow the task, and the architecture map to separate responsibilities. These are conceptual maps; the guide below defines implementation details and verification limits.</p>
<figure class="guide-flow"><figcaption><span class="guide-visual-kicker">01 / Workflow</span>From intent to a checked result</figcaption><ol role="list">'''+steps+'''</ol></figure>
<figure class="guide-architecture"><figcaption><span class="guide-visual-kicker">02 / Architecture</span>Responsibility boundaries</figcaption><ol role="list">'''+layers+'''</ol><p class="guide-visual-note">Connected responsibilities, not a required class hierarchy or an execution trace.</p></figure></section>'''
