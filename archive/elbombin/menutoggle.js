window.onload=function()
{
	var kookie = readCookie('menuState');
	
	if (kookie == 1)
	{
		document.getElementById("coachList").style.display = 'block';
	}

	document.getElementById("allCoaches").onclick=function()
		{
			var x = document.getElementById("coachList").style;
			if (x.display == 'none' || x.display == '')
			{
				x.display = 'block';
				createCookie('menuState', 1, 365);
			}
			else
			{
				x.display = 'none';
				eraseCookie('menuState');
			}
			return false;
		}
}


// --------------------------

function createCookie(name,value,days)
{
	if (days)
	{
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
//	else var expires = "";
	else expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name)
{
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++)
	{
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name)
{
	createCookie(name,"",-1);
}