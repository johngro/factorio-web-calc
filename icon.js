/*Copyright 2015-2019 Kirk McDonald

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.*/
"use strict"

var PX_WIDTH = 32
var PX_HEIGHT = 32

var sheet_hash

function Sprite(name, col, row) {
    this.name = name
    this.icon_col = col
    this.icon_row = row
}

// A class which holds an icon created for an object along with an optional tooltip.
//
// The img for the icon and its associated img will be contain in a span so that they can easily be removed
// from the DOM a a single unit when needed.
//
// obj              : The object from which to create the icon and tooltip.
// suppressTooltip  : when true, do not create the tooltip, even if the settings
//                    say to do so.
// tooltipTarget    : when non-null, the target to attach the tooltip's popper
//                    to.  Otherwise, the target will be the top level span.
// tooltipContainer : when non-null, the target to instantiate the tooltip in.
//                    Otherwise the top level span will be used.
class Icon {
    constructor(obj, suppressTooltip, tooltipTarget, tooltipContainer) {
        let node = document.createElement("span")
        let im = blankImage()

        if (tooltipContainer == null) {
            tooltipContainer = node
        }

        im.classList.add("icon")
        let x = -obj.icon_col * PX_WIDTH
        let y = -obj.icon_row * PX_HEIGHT
        im.style.setProperty("background", "url(images/sprite-sheet-" + sheet_hash + ".png)")
        im.style.setProperty("background-position", x + "px " + y + "px")

        node.appendChild(im)

        if (tooltipsEnabled && obj.renderTooltip && !suppressTooltip) {
            new Tooltip(im, obj.renderTooltip(), tooltipTarget, tooltipContainer)
        } else {
            im.title = obj.name
        }
        im.alt = obj.name

        this.node_ = node
        this.im_ = im
    }

    // Access the top level span which contains the tooltip and the img
    node() { return this.node_ }

    // Access the img tag inside the span.  Useful when styling is needed.
    img_node() { return this.im_ }
}

function getImage(obj, suppressTooltip, tooltipTarget, tooltipContainer) {
    // Shortcut which creates an icon, and just returns the top level node to be
    // inserted into the DOM.
    return new Icon(obj, suppressTooltip, tooltipTarget, tooltipContainer).node()
}

function blankImage() {
    var im = document.createElement("img")
    // Chrome wants the <img> element to have a src attribute, or it will
    // draw a border around it. Cram in this transparent 1x1 pixel image.
    im.src = "images/pixel.gif"
    return im
}

var sprites

function getExtraImage(name) {
    return getImage(sprites[name])
}

function getSprites(data) {
    sheet_hash = data.sprites.hash
    sprites = {}
    for (var name in data.sprites.extra) {
        var d = data.sprites.extra[name]
        sprites[name] = new Sprite(d.name, d.icon_col, d.icon_row)
    }
}
