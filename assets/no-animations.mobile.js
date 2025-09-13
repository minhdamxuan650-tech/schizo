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
