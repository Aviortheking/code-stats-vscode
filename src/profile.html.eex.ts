export default `
<style>
/* Dark theme color palette */
.vscode-dark {
  --color-language: #dbd5b9;  
  --color-primary: #E3C23D;
  --color-secondary: #5D5535;
  --color-bar-background: #303030;
  --color-bar-border: #424242;
}

/* Light theme color palette */
.vscode-light {
  --color-language: #1B2334;  
  --color-primary: #5D78B3;
  --color-secondary: #354567;
  --color-bar-background: #939DB3;
  --color-bar-border: #697080;
}

.profile {
  color: var(--color-language);
}

h3 {
  text-align: center;
}

sup {
  top: -.5em;
  font-size: 75%;
  color: var(--color-primary);
}

.language-progress {
  float: left;
  position: relative;
  width: 6rem;
  height: 6rem;
}

.language-progress .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: var(--color-bar-border);
  color: var(--color-language);
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
}

.language-progress:hover .tooltiptext {
  visibility: visible;
}

.language-progress svg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transform: rotate(-90deg);
}

circle {
  stroke-width: 5;
  fill:transparent;
}

circle.backg {  
  stroke: var(--color-bar-background);
}

circle.newxp {
  stroke: var(--color-primary);  
}

circle.oldxp {
  stroke: var(--color-secondary);
}

.language {
  padding-top: 2rem;
  margin: auto;
  text-align: center;
  color: var(--color-language);  
}

.language span {
  display: block;
  font-weight: bold;
  font-size: 1.1em;
}

.machines {
  clear: both;
  margin-top: 1rem;
  padding-top: 1rem;
}
.machine {
  float: none;
}

.progress {
  height: 20px;
  margin-bottom: 20px;
  background-color: var(--color-bar-background);
  border-radius: 4px;
  border: solid 1px; 
  border-color: var(--color-bar-border);
}

.progress-bar {
  float: left;
  width: 0%;
  height: 100%;
  font-size: 12px;
  line-height: 20px;  
  text-align: center;  
  background-color: var(--color-secondary);
}                  

.progress-bar-new {
  background-color: var(--color-primary);
}



</style>
<div class="profile">
  <h3> \${profile.user} <sup>\${profile.level}</sup> \${profile.total_xp} xp
    <% if( profile.new_xp > 0 ) { %>
      <sup>+<%= profile.new_xp %></sup>
    <% } %>
  </h3>

  <div class="progress">
    <div class="progress-bar" style='width:\${profile.progress}%;'>    
    </div>
    <div class="progress-bar progress-bar-new" style='width:\${profile.new_progress}%;'>    
    </div>
  </div>

  <div class="languages">
    <% for( let l in languages) { %>
      <div class="language-progress">
        <span class="tooltiptext">
          <strong><%=languages[l].xp %> xp</strong>        
          <% if( languages[l].new_xp > 0 ) { %>
            <sup>+<%= languages[l].new_xp %></sup>
          <% } %>        
        </span>
        <svg viewBox="0 0 100 100">
          <circle class="backg" cx="50" cy="50" r="45" ></circle>
          <circle class="newxp" cx="50" cy="50" r="45" stroke-dasharray="282.6" stroke-dashoffset='\${ ((100-languages[l].progress) * 282.6 / 100) }'></circle>
          <circle class="oldxp" cx="50" cy="50" r="45" stroke-dasharray="282.6" stroke-dashoffset='\${ ((100-languages[l].progress + languages[l].new_progress) * 282.6 / 100) }'></circle>
        </svg>
        <div class="language">
          <%= languages[l].name %>
            <span>
              <%= languages[l].level %>
            </span>
        </div>      
      </div>
      <% } %>
  </div>
  <p/>

  <div class="machines">
    <% for( let m in machines) { %>
      <div class="machine">
          <strong>
            <%= machines[m].name %>
          </strong>
          <sup> <%= machines[m].level %> </sup>
          <%= machines[m].xp %> xp
          <% if( machines[m].new_xp > 0 ) { %>
            <sup>+<%= machines[m].new_xp %></sup>
          <% } %>      
        <div class="progress">
          <div class="progress-bar" style='width:\${machines[m].progress}%;'>
          </div>
          <div class="progress-bar progress-bar-new" style='width:\${machines[m].new_progress}%;'>
          </div>
        </div>
      </div>
    <% } %>
  </div>
<div>`