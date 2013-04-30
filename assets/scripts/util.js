
function s(i) {
    if(i == 1)
	return "";
    else
	return "s";
}

function inherits(parent,child) {
    child.prototype=new parent();
    child.prototype.constructor=child;
}
