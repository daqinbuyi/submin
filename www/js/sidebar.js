load('collapsables');

var sidebar_old_load = window.onload;
window.onload = function() {
	if (sidebar_old_load) sidebar_old_load()
	if (!is_admin)
		return;

	setupSidebarImages();
	var sidebar = document.getElementById('sidebar');
	setupCollapsables(sidebar, "showhide", sidebar_collapse, sidebar_expand);

	sidebar.onmousedown = function() { return false; }
	sidebar.onselectstart = function() { return false; } // ie

	 // xml_lists is set in main.html template
	reloadUsers(xml_lists);
	reloadGroups(xml_lists);
	reloadRepositories(xml_lists);
}

var sidebar_img_add_user = new Image();
var sidebar_img_add_group = new Image();
var sidebar_img_add_repository = new Image();
var sidebar_img_add_user_pressed = new Image();
var sidebar_img_add_group_pressed = new Image();
var sidebar_img_add_repository_pressed = new Image();

function setupSidebarImages() {
	var img_user = document.getElementById('sidebar_add_user_img');
	var img_group = document.getElementById('sidebar_add_group_img');
	var img_repository = document.getElementById('sidebar_add_repository_img');

	// if image is not found (for example if not an admin), don't do anything
	if (img_user) {
		sidebar_img_add_user.src = base_url + 'img/add-user.png';
		sidebar_img_add_user_pressed.src = base_url + 'img/add-user-pressed.png';
		img_user.onmousedown = function() { this.src = sidebar_img_add_user_pressed.src; return false; };
		img_user.onmouseup = function() { this.src = sidebar_img_add_user.src; };
		img_user.onmouseout = function() { this.src = sidebar_img_add_user.src; };
	}
	if (img_group) {
		sidebar_img_add_group.src = base_url + 'img/add-group.png';
		sidebar_img_add_group_pressed.src = base_url + 'img/add-group-pressed.png';
		img_group.onmousedown = function() { this.src = sidebar_img_add_group_pressed.src; return false; };
		img_group.onmouseup = function() { this.src = sidebar_img_add_group.src; };
		img_group.onmouseout = function() { this.src = sidebar_img_add_group.src; };
	}
	if (img_repository) {
		sidebar_img_add_repository.src = base_url + 'img/add-repository.png';
		sidebar_img_add_repository_pressed.src = base_url + 'img/add-repository-pressed.png';
		img_repository.onmousedown = function() { this.src = sidebar_img_add_repository_pressed.src; return false; };
		img_repository.onmouseup = function() { this.src = sidebar_img_add_repository.src; };
		img_repository.onmouseout = function() { this.src = sidebar_img_add_repository.src; };
	}
}

function reloadX(xmlData, X, Xplural, Xcapital, deletable) {
	var deletable = true;
	if (X == "repository")
		deletable = false;

	var dest = document.getElementById(Xplural);
	if (dest.childNodes)
		for (var i = dest.childNodes.length; i; --i)
			dest.removeChild(dest.lastChild);

	var response = XMLtoResponse(xmlData);
	var list = FindResponse(response, "list" + Xcapital);
	var Xs = list.xml.getElementsByTagName(X);
	for (var i = 0; i < Xs.length; ++i) {
		var name = Xs[i].getAttribute("name");
		var special_group = false;
		// CRUFT after we convert not to abuse submin-admins
		if (X == "group" && name == "submin-admins")
			special_group = true;
		
		var li = $c("li");
		if (selected_type == Xplural && selected_object == name)
			li.setAttribute("class", "selected");

		var link = $c("a", {href: base_url + Xplural + "/show/" + name, title: name});
		var nameNode = document.createTextNode(name);
		if (special_group) {
			var em = $c("em");
			em.appendChild(nameNode);
			link.appendChild(em);
		} else {
			link.appendChild(nameNode);
		}
		li.appendChild(link);
		if (is_admin && deletable && !special_group) {
			var span = $c("span");
			span.setAttribute("class", "delete" + X);
			var img = $c("img", {src: base_url + "img/min.gif"});
			img.setAttribute("class", "remover");
			span.appendChild(img);
			span.onclick = deleteObject;
			li.appendChild(span);
		}
		dest.appendChild(li);
	}
}

function reloadUsers(xmlData) {
	reloadX(xmlData, "user", "users", "Users", true);
}

function reloadGroups(xmlData) {
	reloadX(xmlData, "group", "groups", "Groups", true);
}

function reloadRepositories(xmlData) {
	reloadX(xmlData, "repository", "repositories", "Repositories", false);
}

function sidebar_collapse(trigger) {
	
}

function sidebar_expand(trigger) {
	var name = trigger.parentNode.getElementsByTagName("ul")[0].id;
	switch (name) {
		case "users":
			reloadUsers(xml_lists);
			break;
		case "groups":
			reloadGroups(xml_lists);
			break;
		case "repositories":
			reloadRepositories(xml_lists);
			break;
	}
}

function deleteObject()
{
	var div = this.parentNode.parentNode
	var type = ''
	switch (div.id) {
		case 'users':
		case 'groups':
			type = div.id
			break
		default:
			return
			break
	}
	var name = this.parentNode.firstChild.firstChild.nodeValue;
	var url = base_url + '' + type + '/delete/' + name

	var answer = confirm('Really delete ' + name + '? There is no undo')
	if (!answer)
		return

	var response = AjaxSyncPostRequest(url, "")
	LogResponse(response)
	if (response.success)
		this.parentNode.parentNode.removeChild(this.parentNode)

	if (selected_type == div.id && name == selected_object)
		window.location = base_url + '';
}
