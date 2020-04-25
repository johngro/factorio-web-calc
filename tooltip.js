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

function Tooltip(reference, content_generator, target, container) {
    if (!target) {
        target = reference
    }
    if (!container) {
        container = document.body
    }
    this.reference = reference
    this.content_generator = content_generator
    this.target = target
    this.container = container
    this.isOpen = false
    this.node = null
    this.popper = null
    this.addEventListeners()
}
Tooltip.prototype = {
    constructor: Tooltip,
    show: function() {
        if (this.isOpen) {
            return
        }

        if (this.node == null) {
            this.create()
        } else {
            this.node.style.display = ""
            this.popper.update()
        }

        this.isOpen = true
    },
    hide: function() {
        if (!this.isOpen) {
            return
        }
        this.isOpen = false
        this.node.style.display = "none"
    },

    create: function() {
        let node = document.createElement("div")
        let content = this.content_generator();

        node.classList.add("tooltip")
        node.style.display = ""
        node.appendChild(content);

        this.popper = new Popper(
            this.target,
            node,
            {
                placement: "right",
                modifiers: {
                    offset: {
                        offset: "0, 20"
                    },
                    preventOverflow: {
                        boundariesElement: "window"
                    }
                }
            }
        )
        this.popper.update()

        this.container.appendChild(node)
        this.node = node
        this.content = content
    },

    addEventListeners: function() {
        var self = this
        this.reference.addEventListener("mouseenter", function() {
            self.show()
        })
        this.reference.addEventListener("mouseleave", function() {
            self.hide()
        })
    },
    updateContentGenerator: function(content_generator) {
        if (this.node) {
            let new_content = content_generator();
            this.node.replaceChild(new_content, this.content)
            this.popper.update()
            this.content = new_content
        }
        this.content_generator = content_generator
    }
}
