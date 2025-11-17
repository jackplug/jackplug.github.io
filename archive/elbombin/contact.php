<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<title>Contact | El Bomb&iacute;n</title>
	<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1" />
	<style type="text/css">
		@import "/stylesheet.css";
		/*\*//*/
		  @import "/stylesheet_IE5mac.css";
		/**/
	</style>

	<!--[if IE]><style type="text/css">@import "/stylesheet_IE.css";</style><![endif]-->

	<!--[if lt IE 6]><style type="text/css">@import "/stylesheet_IE55.css";</style><![endif]-->

	<!--[if lt IE 5.5]><style type="text/css">@import "/stylesheet_IE50.css";</style><![endif]-->

	<script type="text/javascript" src="/menutoggle.js"></script>

	<link rel="Shortcut Icon" href="/favicon.ico" type="image/x-icon" />
</head>

<body id="contactPage">
<div id="wrapper">
<?php include_once('/home/vol7/byethost33.com/b33_2993097/elbombin.homfray.co.cc/htdocs/header.htm'); ?>
	<div id="content">
		<h1>Contact El Bomb&iacute;n</h1>
		<p>Tell us what you think of <strong>El Bomb&iacute;n</strong> - whether you have extra information about the current coach articles, ideas for future coaches, problems with the writing or layout, anything! Either <a href="mailto:thebowlerhat@gmail.com">send us an email</a>, or complete the form.</p>
		<p>As with any communication with <strong>El Bomb&iacute;n</strong>, your email address will <strong>NEVER, EVER</strong> be sold to those nasty little spammers!</p>

		<div id="contactForm">
			<form method="post" action="<? echo $PHP_SELF ?>">
				<fieldset>
					<?php
						if ($send == 'Send' ) {
							$formerror = 0;
							if ($name == '') {
								echo '					<p style="font-size:1.2em; background-color:red; color:yellow; font-weight:bold; width:340px;">Please enter a name</p>';
								$formerror = 1;
							}
							if ($email == '') {
								echo '					<p style="font-size:1.2em; background-color:red; color:yellow; font-weight:bold; width:340px;">Please enter an email address</p>';
								$formerror = 1;
							}
							if ($comments == '') {
								echo '					<p style="font-size:1.2em; background-color:red; color:yellow; font-weight:bold; width:340px;">Please enter your comments</p>';
								$formerror = 1;
							}

							if ($formerror == 0) {
								setlocale (LC_ALL, en_GB);
								$mail_to = 'thebowlerhat@gmail.com';
								$mail_subject = 'El Bombin General Site Feedback - ' . gmstrftime("%a, %e %b, %Y at %R");
								$mail_from = 'From: '. $name . ' <' . $email . '>';
								$mail_body = $comments;
  	  							$mail_body = htmlspecialchars($mail_body);

  	  							if (@mail($mail_to, $mail_subject, $mail_body, $mail_from)) {
									echo '					<p style="font-size:1.2em; color:black; font-weight:bold; width:340px;">Thanks for your input. If required, we will respond to your message within the next 48 hours.</p>';
								} else {
									echo '					<p style="font-size:1.2em; color:black; font-weight:bold; width:340px;">We are very sorry, but there seems to be a problem at our end - please could we ask you to send your comments to <a href="mailto:thebowlerhat@gmail.com">our email address</a>? Thankyou.</p>';
								}
							}
						}
					?>
					<label for="name">Name : </label>
					<input type="text" name="name" id="name" value="<?php echo $name; ?>" /><br />
					<label for="email">Email Address : </label>
					<input type="text" name="email" id="email" value="<?php echo $email; ?>" /><br />
					<label for="comments">Speak And We Will Listen : </label>
					<textarea name="comments" cols="15" rows="7" id="comments"><?php echo $comments; ?></textarea><br />
				</fieldset>
				<div><input type="submit" name="send" value="Send" /></div>
			</form>
		</div>

		<p id="credits"><strong>El Bomb&iacute;n</strong> is Produced and Created by Stuart Homfray, 2005</p>
	</div>

<?php include_once('/home/vol7/byethost33.com/b33_2993097/elbombin.homfray.co.cc/htdocs/sidebar.htm'); ?>
	<div style="clear: both;"></div>

	<div id="footer">
		<p>page 8</p>
	</div>
</div>

<script type="text/javascript">
var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
try {
var pageTracker = _gat._getTracker("UA-10102818-1");
pageTracker._trackPageview();
} catch(err) {}</script>
</body>
</html>