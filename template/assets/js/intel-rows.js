/* intel-rows.js (20261111) - small helpers for pages that render records as table rows or plain cards.
 * Needs intel-updates.js loaded first. Safe no-ops when the component is absent. */
(function () {
  function stamped(r) { return !!(r && (r.added || (Array.isArray(r.updates) && r.updates.length) || r.retired_on)); }
  // tag(el, rec): same as IntelUpdates.tag but safe if the component is missing
  window.intelTag = function (node, rec) {
    return window.IntelUpdates ? window.IntelUpdates.tag(node, rec) : node;
  };
  // intelRows(tr, rec, label, ncols): returns [tr] or [tr, extraTr]; extraTr carries the badge strip + "What changed"
  window.intelRows = function (tr, rec, label, ncols) {
    if (!stamped(rec) || !window.IntelUpdates) return [tr];
    var box = document.createElement('div');
    box.className = 'iu-rowbox';
    var lab = document.createElement('div');
    lab.className = 'iu-rowlabel';
    lab.textContent = label || '';
    box.appendChild(lab);
    window.IntelUpdates.tag(box, rec);
    var td = document.createElement('td');
    td.colSpan = ncols || 1;
    td.appendChild(box);
    var x = document.createElement('tr');
    x.className = 'iu-extra-row';
    x.appendChild(td);
    return [tr, x];
  };
})();
