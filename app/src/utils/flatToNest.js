export default class FlatToNestee {
  config = {
    id: "id",
    parent: "parent",
    children: "children",
    options: { deleteParent: true },
  }

  constructor(config) {
    this.config = {
      id: "id",
      parent: "parent",
      children: "children",
      options: { deleteParent: true },
      ...config,
    }
  }

  initPush(arrayName, obj, toPush) {
    if (obj[arrayName] === undefined) {
      obj[arrayName] = [];
    }
    obj[arrayName].push(toPush);
  }

  convert(flat) {
    let i, len, temp, roots, id, parent, nested, pendingChildOf, flatEl;
    i = 0;
    roots = [];
    temp = {};
    pendingChildOf = {};

    for (i, len = flat.length; i < len; i++) {
      flatEl = flat[i];
      id = flatEl[this.config.id];
      parent = flatEl[this.config.parent];
      temp[id] = flatEl;
      if (parent === undefined || parent === null) {
        // Current object has no parent, so it's a root element.
        roots.push(flatEl);
      } else {
        if (temp[parent] !== undefined) {
          // Parent is already in temp, adding the current object to its children array.
          this.initPush(this.config.children, temp[parent], flatEl);
        } else {
          // Parent for this object is not yet in temp, adding it to pendingChildOf.
          this.initPush(parent, pendingChildOf, flatEl);
        }
        if (this.config.options.deleteParent) {
          delete flatEl[this.config.parent];
        }
      }
      if (pendingChildOf[id] !== undefined) {
        // Current object has children pending for it. Adding these to the object.
        this.multiInitPush(this.config.children, flatEl, pendingChildOf[id]);
      }
    }

    if (roots.length === 1) {
      nested = roots[0];
    } else if (roots.length > 1) {
      nested = {};
      nested[this.config.children] = roots;
    } else {
      nested = {};
    }
    return nested;
  }

  multiInitPush(arrayName, obj, toPushArray) {
    var len;
    len = toPushArray.length;
    if (obj[arrayName] === undefined) {
      obj[arrayName] = [];
    }
    while (len-- > 0) {
      obj[arrayName].push(toPushArray.shift());
    }
  }
}
