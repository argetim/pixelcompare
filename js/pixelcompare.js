"use strict";
/**
 * PIXELCOMPARE
 * Javascript image comparison
 * @author diamanthaxhimusa@gmail.com
 */
(function () {
  var _extend = function (defaults, options) {
    var extended = {};
    var prop;
    for (prop in defaults) {
      if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
        extended[prop] = defaults[prop];
      }
    }
    for (prop in options) {
      if (Object.prototype.hasOwnProperty.call(options, prop)) {
        extended[prop] = options[prop];
      }
    }
    return extended;
  };
  
  var _addClass = function (element, classname) {
    var arr;
    arr = element.className.split(" ");
    if (arr.indexOf(classname) == -1) {
      element.className += " " + classname;
    }
  };
  
  var _hasClass = function (element, className) {
    return new RegExp("(\\s|^)" + className + "(\\s|$)").test(element.className);
  };
  
  var _removeClass = function (element, className) {
    element.classList.remove(className);
  };
  
  var _wrap = function (element, tag, sliderOrientation) {
    var div = document.createElement(tag);
    _addClass(div, "pixelcompare-wrapper pixelcompare-" + sliderOrientation);
    element.parentElement.insertBefore(div, element);
    div.appendChild(element);
    return div;
  };
  
  var options = {
    default_offset_pct: 0.5,
    orientation: "horizontal",
    overlay: false,
    hover: false,
    move_with_handle_only: true,
    click_to_move: false
  };
  
  var pcContainers = document.querySelectorAll('[data-pixelcompare]');

  pcContainers.forEach(function (pcContainer) {
    var sliderPct = options.default_offset_pct;
    var imageContainer = pcContainer;
    options.hover = pcContainer.hasAttribute("data-hover");
    options.orientation = pcContainer.hasAttribute("data-vertical") ? "vertical":"horizontal";
    var orientations = ['vertical', 'horizontal', 'sides'];

    var datasetOrientation = imageContainer.dataset.pixelcompareOrientation;
    var sliderOrientation = orientations.includes(datasetOrientation) ? datasetOrientation : options.orientation;
    var beforeDirection = sliderOrientation === "vertical" ? "down" : "left";
    var afterDirection = sliderOrientation === "vertical" ? "up" : "right";

    var container = _wrap(pcContainer, "div", sliderOrientation);

    var beforeImg = container.querySelectorAll("img")[0];
    beforeImg.draggable = false;
    var afterImg = container.querySelectorAll("img")[1];
    afterImg.draggable = false;

    var node = document.createElement("div");
    _addClass(node, "pixelcompare-handle");
    container.appendChild(node);

    var slider = container.querySelector(".pixelcompare-handle");
    var sliderChildNodeBeforeDirection = document.createElement("span");
    _addClass(
      sliderChildNodeBeforeDirection,
      "pixelcompare-" + beforeDirection + "-arrow"
    );
    slider.appendChild(sliderChildNodeBeforeDirection);
    // container.append("<span class='twentytwent-slide-line'></span>");
    var sliderChildNodeAfterDirection = document.createElement("span");
    _addClass(
      sliderChildNodeAfterDirection,
      "pixelcompare-" + afterDirection + "-arrow"
    );
    slider.appendChild(sliderChildNodeAfterDirection);
    _addClass(container, "pixelcompare-container");
    _addClass(beforeImg, "pixelcompare-before");
    _addClass(afterImg, "pixelcompare-after");
    if (options.overlay) {
      var overlayNode = document.createElement("div");
      _addClass(overlayNode, "pixelcompare-overlay");
      container.appendChild(overlayNode);
    }

    var calcOffset = function calcOffset(dimensionPct) {
      var w = beforeImg.getBoundingClientRect().width;
      var h = beforeImg.getBoundingClientRect().height;
      return {
        w: w + "px",
        h: h + "px",
        wp: dimensionPct * 100,
        cw: dimensionPct * w + "px",
        ch: dimensionPct * h + "px"
      };
    };

    var adjustContainer = function adjustContainer(offset) {
      if (sliderOrientation === "vertical") {
        beforeImg.style.clip =
          "rect(0, " + offset.w + ", " + offset.ch + ", 0)";
        afterImg.style.clip =
          "rect(" + offset.ch + ", " + offset.w + ", " + offset.h + ", 0)";
      } else if (sliderOrientation === "sides") {
        beforeImg.style.clipPath =
          `polygon(0% ${2 * (50 - offset.wp)}%, ${2 * offset.wp}% 100%, 0% 100%)`;
        afterImg.style.clipPath =
          `polygon(100% ${(2 * (100 - offset.wp))}%, ${-2 * (50 - offset.wp)}% 0%, 100% 0%)`;
      } else {
        beforeImg.style.clip =
          "rect(0, " + offset.cw + ", " + offset.h + ", 0)";
        afterImg.style.clip =
          "rect(0, " + offset.w + "," + offset.h + "," + offset.cw + ")";
      }
      container.style.height = offset.h;
    };

    var adjustSlider = function adjustSlider(pct) {
      var offset = calcOffset(pct);
      if (sliderOrientation === "vertical") slider.style.top = offset.ch;
      else {
        slider.style.left = offset.cw;
      }
      adjustContainer(offset);
    };

    // Return the number specified or the min/max number if it outside the range given.
    var minMaxNumber = function minMaxNumber(num, min, max) {
      return Math.max(min, Math.min(max, num));
    };

    // Calculate the slider percentage based on the position.
    var getSliderPercentage = function getSliderPercentage(
      positionX,
      positionY
    ) {
      var sliderPercentage =
        sliderOrientation === "vertical"
          ? (positionY - offsetY) / imgHeight
          : (positionX - offsetX) / imgWidth;
      return minMaxNumber(sliderPercentage, 0, 1);
    };

    window.addEventListener("resize.pixelcompare", function (e) {
      adjustSlider(sliderPct);
    });

    var offsetX = 0;
    var offsetY = 0;
    var imgWidth = 0;
    var imgHeight = 0;
    var onMoveStart = function (e) {
      if (
        ((e.distX > e.distY && e.distX < -e.distY) ||
          (e.distX < e.distY && e.distX > -e.distY)) &&
        sliderOrientation !== "vertical"
      ) {
        e.preventDefault();
      } else if (
        ((e.distX < e.distY && e.distX < -e.distY) ||
          (e.distX > e.distY && e.distX > -e.distY)) &&
        sliderOrientation === "vertical"
      ) {
        e.preventDefault();
      }
      _addClass(container, "active");
      offsetX = container.offsetLeft;
      offsetY = container.offsetTop;
      imgWidth = beforeImg.getBoundingClientRect().width;
      imgHeight = beforeImg.getBoundingClientRect().height;
    };
    var onMove = function (e) {
      if (_hasClass(container, "active")) {
        sliderPct = getSliderPercentage(
          e.pageX || e.changedTouches[0].pageX,
          e.pageY || e.changedTouches[0].pageY
        );
        adjustSlider(sliderPct);
      }
    };
    var onMoveEnd = function () {
      _removeClass(container, "active");
    };

    if (options.hover) {
      container.addEventListener("mouseenter", onMoveStart);
      container.addEventListener("mouseleave", onMoveEnd);
      container.addEventListener("mousemove", onMove);
    } else {
      var moveTarget = options.move_with_handle_only ? slider : container;
      window.addEventListener("mouseup", onMoveEnd);
      container.addEventListener("mousemove", onMove);
      moveTarget.addEventListener("mousedown", onMoveStart);
      moveTarget.addEventListener("touchstart", onMoveStart);
      container.addEventListener("touchmove", onMove);
      window.addEventListener("touchend", onMoveEnd);
    }


    slider.addEventListener("touchmove", function (e) {
      e.preventDefault();
    });

    container
      .querySelector("img")
      .addEventListener("mousedown", function (event) {
        event.preventDefault();
      });

    if (options.click_to_move) {
      container.on("click", function (e) {
        offsetX = container.offset().left;
        offsetY = container.offset().top;
        imgWidth = beforeImg.width();
        imgHeight = beforeImg.height();
        sliderPct = getSliderPercentage(e.pageX, e.pageY);
        adjustSlider(sliderPct);
      });
    }
    window.dispatchEvent(new Event("resize.pixelcompare"));
  });
})();
