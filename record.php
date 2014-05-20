<?php
	start_session();
	$appname = 'wherewewalk';
	$_SESSION[$appname . '-data'] = $POST[$appname . '-data'];
?>