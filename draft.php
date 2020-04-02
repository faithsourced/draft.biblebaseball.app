<?
header("Content-Type: application/json; charset=utf-8"); 

function cleanInput($input) {
	$output = trim($input);																					// trim
	
	$search = array();

	$search[] = '@<script[^>]*?>.*?</script>@si'; 															// strip out javascript
	$search[] = '|(?mi-Us)<[\\s]*?script[\\s]*?>.*?<[\\s]*?/[\\s]*?script[\\s]*?>|';						// strip out more javascript
	$search[] ='@<style[^>]*?>.*?</style>@siU';																// strip style tags properly
	$search[] ='@<![\s\S]*?-[ \t\n\r]*>@';																	// strip multi-line comments
	$search[] ='@<[\/\!]*?[^<>]*?>@si';																		// strip out html tags
	$search[] ='@((ht|f)tp(s?)\:\/\/)?@si';																	// strip out url protocol references

	$output = preg_replace($search, '', $output);
	
	$output = str_replace(array("\r", "\n"), " ", $output);													// remove line breaks
	$output = preg_replace('/\s+/', ' ', $output);															// remove extraneous spaces
	$output = str_replace("\t", "", $output);																// remove tabs	
	$output = preg_replace('/(\x{A0})/u', ' ', $output); 													// convert non breaking spaces to normal spaces
	$output = preg_replace('/(\x{200e}|\x{200f}|\x{202a}|\x{202c})/u', '', $output); 						// remove control characters
	$output = preg_replace('/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/', '', $output);								// remove high ascii characters
		
	return $output;
}

function sanitize($input) {
	if (is_array($input)) {
		$output = array();
		
		foreach($input as $var=>$val) {
			$output[$var] = sanitize($val);
		}
	}
	else {
		$output  = cleanInput($input);
	}
	return $output;
}

$_POST = sanitize($_POST);

$response = [];

if(!$_POST['email'] || !preg_match("/^[_a-z0-9-+]+(\.[_a-z0-9-+]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,63})$/i", strtolower($_POST['email']))) {
	$response["errors"][] = ["status"=>"422","title"=>"Error.","detail"=>"The email address is invalid."];
}
else {
	if($_POST['question'] && $_POST['answer'] && $_POST['incorrect1'] && $_POST['incorrect2'] && $_POST['incorrect3']) {
		include('lib/phpmailer/PHPMailerAutoload.php');
		include('config/smtp.php');
		
		$mail = new PHPMailer();
		$mail->CharSet = 'UTF-8';
		//$mail->SMTPDebug = 2;
		
		$mail->isSMTP();

		$mail->Host = $smtp_host;
		$mail->Port = $smtp_port;
		$mail->Username = $smtp_username;

		$mail->SMTPAuth = true;
		$mail->Password = $smtp_password;

		$mail->setFrom($smtp_username, $smtp_from_name);
		$mail->addReplyTo($_POST['email'], $_POST['email']);
		$mail->addAddress($smtp_to_email, $smtp_to_name);
		$mail->Subject = 'Bible Baseball - Draft a Question';

		$message_pieces = [];

		$message_pieces[0]["id"] = 1;
		$message_pieces[0]["question"] = ucfirst($_POST['question']);
		$message_pieces[0]["choices"][0]["id"] = 1;
		$message_pieces[0]["choices"][0]["text"] = $_POST['answer'];
		$message_pieces[0]["choices"][1]["id"] = 2;
		$message_pieces[0]["choices"][1]["text"] = $_POST['incorrect1'];
		$message_pieces[0]["choices"][2]["id"] = 3;
		$message_pieces[0]["choices"][2]["text"] = $_POST['incorrect2'];
		$message_pieces[0]["choices"][3]["id"] = 3;
		$message_pieces[0]["choices"][3]["text"] = $_POST['incorrect3'];
		$message_pieces[0]["answer"][0]["id"] = 1;
		$message_pieces[0]["answer"][0]["explanation"] = $_POST['answer'];

		if($_POST['explanation']) {
			$message_pieces[0]["answer"][0]["explanation"] .= " - " . $_POST['explanation'];
		}

		if($_POST['reference']) {
			$message_pieces[0]["answer"][0]["explanation"] .= " (".$_POST['reference'].")";
		}

		$message = json_encode($message_pieces);

		$mail->msgHTML($message);

		if ($mail->send()) {
			$response["success"][] = ["status"=>"200","title"=>"Thank you!","detail"=>"Your question has been sent."];
		}
		else {
			$response["errors"][] = ["status"=>"500","title"=>"Error.","detail"=>"Your question did not send. There was a problem with the email server."];
		}
	}
	else {
		$response["errors"][] = ["status"=>"422","title"=>"Error.","detail"=>"The submission was missing some or all of the important parts.","report"=>$_POST];
	}
}
echo json_encode($response);
?>