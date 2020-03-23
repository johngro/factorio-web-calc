/* Copyright 2020 John Grossman

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

class Selector {
    constructor(id, options_generator, content_generator, initial_selection, on_selection_changed) {
        if (id == null) {
            id = "selector-" + Selector.id_gen++
        }

        this.id = id

        this.display_node = document.createElement("span")
        this.display_node.id = this.id
        this.on_selection_changed = on_selection_changed

        let dropdown_wrapper = d3.select(this.display_node).append("div")
            .classed("dropdownWrapper", true)
        dropdown_wrapper.append("div")
            .classed("clicker", true)
            .on("click", () => this.closeDropdown())
        let dropdown = dropdown_wrapper.append("div")
            .classed("dropdown", true)
        dropdown_wrapper.append("div")
            .classed("spacer", true)

        this.options_generator = options_generator;
        this.content_generator = content_generator;
        this.selected_item = initial_selection
        this.dropdown = dropdown
        this.dropdown_wrapper = dropdown_wrapper
        this.visible = false

        // Make sure that the initial content binds its tooltip to the icon it
        // generates so that when we destroy the initial content element for the
        // first time, we also destroy the tooltip.
        this.tooltip_container = null
        this.generateInitialContent()
    }

    clearInitialContent() {
        const dnode = this.dropdown.node();
        while (dnode.firstChild) {
            dnode.removeChild(dnode.lastChild)
        }
    }

    generateInitialContent() {
        this.dropdown
            .append(() => this.content_generator(this, this.selected_item))
            .classed("initialSelection", true)
            .on("click", () => this.generateDropdown())
    }

    generateDropdown() {
        if (this.options_generator !== null) {
            // Clear the old initial content
            this.clearInitialContent()

            // New tooltips should bind to the top level dropdown wrapper.  This
            // ensures that they go away properly when the dropdown is
            // destroyed, but do not get clipped by the layout of the inner
            // dropdown element.
            this.tooltip_container = this.dropdown_wrapper.node()

            // Create the options selection using the user provided hook
            let options = this.options_generator(this)
            this.options_generator = null

            // Now create all of the inputs and their associated labels.  Use
            // the user provided content_generator hook to generate the label
            // content
            let id = this.id + "-dropdown"
            let link_id = this.id + "-input-"
            let input_id = 0
            let label_id = 0

            options
                .on("click", () => {
                    if (d3.event.eventPhase == Event.AT_TARGET) {
                        this.openDropdown()
                    }
                })

            options.append("input")
                .on("change", (d, i, nodes) => {
                    this.itemSelected(d, i, nodes)
                })
                .attr("id", () => link_id + input_id++)
                .attr("name", id)
                .attr("type", "radio")
                .property("checked", (d, i) => d === this.selected_item)
            
            options.append("label")
                .attr("for", () => link_id + label_id++)
                .append( (d, i, nodes) => this.content_generator(this, d, i, nodes) )

            this.options = options

            // Now show the dropdown
            this.openDropdown()
        }
    }

    openDropdown() {
        if (!this.visible) {
            this.hideTooltip()
            this.dropdown_wrapper.node().classList.add("open")
            this.visible = true
        }
    }

    closeDropdown() {
        if (this.visible) {
            this.dropdown_wrapper.node().classList.remove("open")
            this.visible = false;
        }
    }

    itemSelected(d, i, nodes) {
        this.selected_item = d
        this.closeDropdown()
        this.on_selection_changed(d, i, nodes)
        this.updateTooltip();
    }

    setSelected(d) {
        this.selected_item = d

        // If we still have our options generator, then we have never been
        // opened.  Regenerate the initial content.  Otherwise, recompute the
        // checked properties of our content and make sure that our tooltip is
        // up-to-date
        if (this.options_generator) {
            this.clearInitialContent()
            this.generateInitialContent()
        } else {
            this.options.select("input")
                .property("checked", (d, i) => d === this.selected_item)
            this.updateTooltip()
        }
    }

    updateTooltip() {
        if (tooltipsEnabled) {
            // If there is a selected item, and that item can render a tooltop,
            // then do so.  Otherwise, if we cannot generate a tooltip with the
            // current selection, and we have a tooltip, remove it.
            if (this.selected_item && this.selected_item.renderTooltip) {
                // If we have no tooltip now, make one.  Otherwise, update the
                // content generator for the existing one.
                if (this.tooltip == null) {
                    this.tooltip = new Tooltip(this.display_node, () => this.selected_item.renderTooltip(), null, this.tooltip_container)
                } else {
                    this.tooltip.updateContentGenerator(() => this.selected_item.renderTooltip())
                }
            } else
            if (this.tooltip) {
                // if the tooltip was created and has been shown before, then
                // remove its node from the DOM
                if (tooltip.node) {
                    let p = this.tooltip.node.parentNode
                    p.removeChild(this.tooltip.node)
                }

                // Now let go of the tooltip object
                this.tooltip = null
            }
        }
    }

    hideTooltip() {
        if (this.tooltip != null) {
            this.tooltip.hide()
        }
    }

    node() { return this.display_node; }

    static makeSimpleDropdown(id, options, initial_selection, on_selection_changed, content_generator) {
        let options_generator = (selector) => {
            return selector.dropdown.selectAll("div")
                        .data(options)
                        .join("div")
        }

        if (!content_generator) {
            content_generator = (selector, d) => {
                return getImage(d, false, selector.dropdown.node(), selector.tooltip_container)
            }
        }

        return new Selector(id, options_generator, content_generator, initial_selection, on_selection_changed)
    }

    static makeFactoryForRecipe(recipe, on_selection_changed) {
        let avail_factories = spec.factories[recipe.category]

        let factory_spec = spec.getFactory(recipe)
        let factory = avail_factories.find( f => f.name == factory_spec.name )

        return Selector.makeSimpleDropdown(null, avail_factories, factory, on_selection_changed)
    }
}

Selector.id_gen = 0
