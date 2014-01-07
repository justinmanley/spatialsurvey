<?php 

	$ldap = ldap_connect('ldaps://ldap.uchicago.edu') or die('Could not connect to ldap server.');
	$dn = 'ou=college,dc=uchicago,dc=edu';
	// $studentid = 'ucStudentId=' . $_POST['studentid'];
	$uid = 'uid=' . $_POST['studentid'];
	$bind = ldap_search($ldap, $dn, $uid);
	if ($bind) 
	{
		$info = ldap_get_entries($ldap, $bind);
		print_r($info);
	} 
	else {
		die('Failed to bind to ldap.');
	}	

?>