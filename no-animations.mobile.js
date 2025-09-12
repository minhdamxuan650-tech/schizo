(function(){
  try {
    var isSmall = window.matchMedia && window.matchMedia("(max-width: 1024px)").matches;
    if (!isSmall) return;
    var badTokens = ["animate","animated","wow","marquee","parallax","floating","float","bounce","pulse","shake","wiggle","spin","rotate","tilt","jiggle","drift","dribble","wander"];
    var walk = function(el){
      if (!el || !el.classList) return;
      var toRemove = [];
      el.classList.forEach(function(c){
        var lc = String(c).toLowerCase();
        for (var i=0;i<badTokens.length;i++){
          if (lc.indexOf(badTokens[i]) !== -1) { toRemove.push(c); break; }
        }
      });
      toRemove.forEach(function(c){ try { el.classList.remove(c); } catch(e){} });
    };
    // strip classes on body descendants
    var all = document.querySelectorAll("*");
    for (var i=0;i<all.length;i++){ walk(all[i]); }
    // ensure socials visible if present
    var socials = document.querySelector("#topSocial, .top-social, .social, .socials, .social-icons");
    if (socials){
      socials.style.opacity = "1";
      socials.style.visibility = "visible";
      socials.style.transform = "none";
    }
    // stop requestAnimationFrame loops that may move things
    if (window.cancelAnimationFrame && window.requestAnimationFrame){
      var raf = window.requestAnimationFrame(function(){});
      while (raf--) { try { window.cancelAnimationFrame(raf); } catch(e){} }
    }
  } catch(e){ /* noop */ }
})();

// Hide any element that renders the text "VIEW CONTRACT" on small screens
(function(){
  try {
    var isSmall = window.matchMedia && window.matchMedia("(max-width: 1024px)").matches;
    if (!isSmall) return;
    var nodes = document.querySelectorAll('a,button,.btn,.button,.cta,[role="button"],p,span,div');
    for (var i=0;i<nodes.length;i++){
      var el = nodes[i];
      var t = (el.innerText || el.textContent || "").trim().toUpperCase();
      if (t === "VIEW CONTRACT" || t.indexOf("VIEW CONTRACT") !== -1){
        el.style.display = "none";
      }
    }
  } catch(e){ /* noop */ }
})();

// --- Mobile/Tablet hardening: slide-3 cleanup (<=1024px) ---
(function(){
  var isSmall = window.matchMedia && window.matchMedia("(max-width: 1024px)").matches;
  if (!isSmall) return;

  function hideViewContractOnce(root){
    try {
      var nodes = (root || document).querySelectorAll('a,button,.btn,.button,.cta,[role="button"],p,span,div');
      for (var i=0;i<nodes.length;i++){
        var el = nodes[i];
        var txt = (el.innerText || el.textContent || "").replace(/\s+/g," ").trim().toUpperCase();
        if (!txt) continue;
        if (/\bVIEW\s+CONTRACT\b/.test(txt)){
          // Hide the nearest actionable container (button/link)
          var target = el;
          for (var up=0; up<3 && target; up++){
            if (typeof target.tagName === "string" && /^(A|BUTTON)$/i.test(target.tagName)) break;
            target = target.parentElement;
          }
          (target || el).style.display = "none";
        }
      }
    } catch(e){}
  }

  function stripButtonGroupFrames(root){
    try {
      var scope = (root || document);
      var containers = scope.querySelectorAll('*');
      for (var i=0;i<containers.length;i++){
        var c = containers[i];
        var btnCount = c.querySelectorAll('a.btn, a.button, .btn, .button, .cta, button').length;
        if (btnCount >= 2){
          var cs = getComputedStyle(c);
          var hasFrame = (parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderRightWidth) > 0 ||
                          parseFloat(cs.borderBottomWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0 ||
                          cs.outlineStyle !== 'none' || (cs.boxShadow && cs.boxShadow !== 'none'));
          if (hasFrame){
            c.style.border = 'none';
            c.style.outline = 'none';
            c.style.boxShadow = 'none';
          }
        }
      }
      // Also ensure individual buttons have no outline glow
      var btns = scope.querySelectorAll('a,button,.btn,.button,.cta,[role="button"]');
      for (var j=0;j<btns.length;j++){
        var b = btns[j];
        b.style.outline = 'none';
        b.style.boxShadow = 'none';
      }
    } catch(e){}
  }

  function runAll(root){
    hideViewContractOnce(root);
    stripButtonGroupFrames(root);
  }

  // Initial pass
  runAll(document);

  // Observe DOM changes to catch dynamic insertions
  try {
    var obs = new MutationObserver(function(muts){
      for (var k=0;k<muts.length;k++){
        var m = muts[k];
        if (m.addedNodes){
          for (var n=0;n<m.addedNodes.length;n++){
            var node = m.addedNodes[n];
            if (node && node.nodeType === 1){
              runAll(node);
            }
          }
        }
      }
    });
    obs.observe(document.documentElement, {childList: true, subtree: true});
  } catch(e){}
})();
