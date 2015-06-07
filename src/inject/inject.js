/* global chrome */
/* global $ */
Selection.prototype.expandSelection = function()
{

    var ranges = [];

    for(var i = 0; i < this.rangeCount; i++) {
        var range = this.getRangeAt(i);
        while ((range.startContainer.nodeType == 3) || (range.startContainer.childNodes.length == 1)) {
            range.setStartBefore(range.startContainer);
        }
        while ((range.endContainer.nodeType == 3) || (range.endContainer.childNodes.length == 1)) {
            range.setEndAfter(range.endContainer);
        }
        ranges.push(range);
    }

    this.removeAllRanges();

    for (var i = 0; i < ranges.length; i++) {
        this.addRange(ranges[i]);
    }

    return;

}

function highlightElement(el)
{

    var selection = window.getSelection();        
    var range = document.createRange();
    range.selectNodeContents(el);
    selection.removeAllRanges();
    selection.addRange(range);

}

function getSelectedElement()
{

    var sel = getSelection();
    if (sel.isCollapsed) {
        return false;
    }

    if (sel.rangeCount > 0) {
        var container = sel.getRangeAt(0).commonAncestorContainer;
        while (container.nodeType != 1) {
            container = container.parentNode;
        }
        return $(container);
    }

}

function testUnique(selector, originalText)
{

    if (($(selector).length == 1) && ($(selector).text().trim() == originalText)) {
        return selector;
    }

    // Return the first child of the set
    for (var i = 0; i < $(selector).length; i++) {
        if ($(selector + ':nth(' + i + ')').text().trim() == originalText) {
            return selector + ':nth(' + i + ')';
        }
    }

}

function findUniqueIdent(el, originalText)
{

    var selector;
    var semiUniqueSelector;
    var unique;
    var elName = el[0].nodeName;

    if (el.attr('id')) {
        selector = elName + '#' + el.attr('id');
        unique = testUnique(selector, originalText);
        if (unique) {
            return unique;
        }
    }

    // Identifier not unique or doesn't exist
    if (el.attr('class')) {
        // Try a combo of all classes first
        var classes = el.attr('class').split(/[ ]+/);
        selector = elName + '.' + classes.join('.');
        unique = testUnique(selector, originalText);
        if (unique) {
            return unique;
        }
        // Now try each individually
        for (var k in classes) {
            selector = '.' + classes[k];
            unique = testUnique(selector, originalText);
            if (unique) {
                return unique;
            }
        };
    }

    var generics = ['DIV', 'SPAN', 'TABLE', 'TR', 'TD', 'P'];
    // Test element name for non-generic tags
    if (generics.indexOf(elName) == -1) {
        selector = elName;
        unique = testUnique(selector, originalText);
        if (unique) {
            return unique;
        }
    }

    // Try one level up just in case all else fails

    // First determine a semi-unique identifier
    if (el.attr('id')) {
        semiUniqueSelector = elName + '#' + el.attr('id');
    } else
    if (el.attr('class')) {
        // Try a combo of all classes first
        semiUniqueSelector = elName + '.' + el.attr('class').split(/[ ]+/).join('.');
    } else {
        semiUniqueSelector = elName;
    }

    while (true) {
        if ((el.parent().attr('id')) || (el.parent().attr('class'))) {
            break;
        }
        el = el.parent();
    }

    var elParentName = el.parent()[0].nodeName;

    if (el.parent().attr('id')) {
        selector = elParentName + '#' + el.parent().attr('id') + ' ' + semiUniqueSelector;
        unique = testUnique(selector, originalText);
        if (unique) {
            return unique;
        }
        // Try on its own
        selector = elParentName + '#' + el.parent().attr('id');
        unique = testUnique(selector, originalText);
        if (unique) {
            return unique;
        }
    }
    if (el.parent().attr('class')) {
        var parentClasses = el.parent().attr('class').split(/[ ]+/);
        selector = elParentName + '.' + parentClasses.join('.') + ' ' + semiUniqueSelector;
        unique = testUnique(selector, originalText);
        if (unique) {
            return unique;
        }
        // Try on its own
        selector = elParentName + '.' + parentClasses.join('.');
        unique = testUnique(selector, originalText);
        if (unique) {
            return unique;
        }
    }

}

/**
 * Startup
 */
chrome.extension.sendMessage({}, function(response) {

	var readyStateCheckInterval = setInterval(function() {
    	if (document.readyState === "complete") {
    		clearInterval(readyStateCheckInterval);
            $(document).bind("mouseup", function() {
                var selectedEl = getSelectedElement();
                if (selectedEl) {
                    var originalText = selectedEl.text().trim();
                    var unique = findUniqueIdent(selectedEl, originalText);
                    // Make sure the element we found is highlighted fully
                    console.log(selectedEl, unique, $(unique).text().trim());
                    if ($(unique).length) {
                        highlightElement($(unique)[0]);
                    }
                }
            });
    	}
	}, 10);

});