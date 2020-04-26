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

function makeItemInfoChart(table_selection_str, recipes) {
    recipes.sort((a, b) => {
        let ai = a.products[0].item
        let bi = b.products[0].item
        let ret = ai.group.localeCompare(bi.group)
        if (!ret) {
            let ret = ai.name.localeCompare(bi.name)
        }
        return ret
    })

    recipes.forEach((recipe, ndx, array) => {
        array[ndx] = [ recipe, recipe.ingredients, recipe.products ]
    })

    // Purge the contents of the table body
    //
    // TODO(johngro) : instead of purging and re-creating everything, figure out
    // how to do this using d3's update
    let tbody = d3.select(table_selection_str)
    while (tbody.node().firstChild) {
        tbody.node().removeChild(tbody.node().lastChild)
    }

    render_ingredient = (i, p) => {
        let icon = makeProductElement(i, p)
        p.appendChild(icon)

        icon.addEventListener("click", () => {
            removeAllTargets()
            addTarget(i.item.name)
            itemUpdate()
        })
    }

    tbody.selectAll("tr")
      .data(recipes)
      .join("tr")
      .classed("item-info-row", true)
          .selectAll("td")
          .data(d => d)
          .join("td")
          .each((d, i, nodes) => {
              switch (i) {
              case 0:
                  d3.select(nodes[i])
                      .classed("item-info-recipe", true)
                      .append( _ => getImage(d, false))
                  break;

              case 1:
                  d3.select(nodes[i])
                    .classed("item-info-ingredient", true)
                    .selectAll("span")
                    .data(d)
                    .join("span")
                    .classed("item-info-ingredient-span", true)
                    .each((d, i, nodes) => { render_ingredient(d, nodes[i]) })
                  break;

              case 2:
                  d3.select(nodes[i])
                    .classed("item-info-product", true)
                    .selectAll("span")
                    .data(d)
                    .join("span")
                    .classed("item-info-product-span", true)
                    .each((d, i, nodes) => { render_ingredient(d, nodes[i]) })
                  break;
                  break;

              default:
                  break;
              }
          })
}

function updateUses(targets) {
    // Make a list of all the unique recipes which make use of any of the targets
    let uses = []
    let recipes = []
    targets.forEach(t => {
        item = allItems[t.itemName]
        if (item) {
            item.uses.forEach(use => {
                if (!uses.find(u => u === use)) {
                    uses.push(use)
                }
            })

            item.recipes.forEach(recipe => {
                if (!recipes.find(r => r === recipe)) {
                    recipes.push(recipe)
                }
            })
        }
    })

    makeItemInfoChart("#made-by-table>tbody", recipes)
    makeItemInfoChart("#used-by-table>tbody", uses)
}
