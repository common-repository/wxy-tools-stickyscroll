<?php
	/*
		options and documentation for WXY Tools Stickyscroll Plugin
		(c)2016-Present Clarence "exoboy" Bowman and Bowman Design Works.
		WXY Tools™ at http://www.wxytools.com
		
	*/
?>

<!-- ============================= -->
<!-- page content starts here OPEN --><div style="width:80%;height:auto;position:relative;display:block;margin:0px auto;">
<h1>Welcome</h1>
	
<p style="font-size:18px;">There are currently no options or settings you need to worry about for this plugin.</p>
<p style="font-size:18px;">Just remember that once it is activated, it will save all of your scroll positions on all of the pages/panels you visit in the admin area of WordPress.</p>
<p style="font-size:18px;">Whenever a page refresh event occurs, it will restore those scroll positions, so you don't have to wear out your fingers on the mousewheel.</p>

<!-- content spacer --><div style="width:100%;height:25px;position:relative;display:block;float:none;clear:both;"></div>

<h1>Shortcut</h1>
<p style="font-size:18px;">To snap back to the top of the page, simply flick the mousewheel up three times and bam! You're back on top!</p>

<!-- content spacer --><div style="width:100%;height:25px;position:relative;display:block;float:none;clear:both;"></div>
	
<h1>Love this Plugin?</h1>
<p style="font-size:18px;">Then send me buck! Thanks!</p>

<!-- content spacer --><div style="width:100%;height:25px;position:relative;display:block;float:none;clear:both;"></div>

<div id="paypal-button-container" style="width:350px;"></div>
<script src="https://www.paypal.com/sdk/js?client-id=sb&currency=USD" data-sdk-integration-source="button-factory"></script>
<script>
  paypal.Buttons({
      style: {
          shape: 'pill',
          color: 'gold',
          layout: 'vertical',
          label: 'pay',
          
      },
      createOrder: function(data, actions) {
          return actions.order.create({
              purchase_units: [{
                  amount: {
                      value: '1'
                  }
              }]
          });
      },
      onApprove: function(data, actions) {
          return actions.order.capture().then(function(details) {
              alert('Transaction completed by ' + details.payer.name.given_name + '!');
          });
      }
  }).render('#paypal-button-container');
</script>

<!-- content spacer --><div style="width:100%;height:25px;position:relative;display:block;float:none;clear:both;"></div>
<!-- divider bar --><div style="width:90%;height:2px;background-color:#666;position:relative;"></div>
<!-- content spacer --><div style="width:100%;height:25px;position:relative;display:block;float:none;clear:both;"></div>
	<span style="font-size:18px;font-style:italic;display:block;width:65%;height:auto;position:relative;text-align:left;"><a href="http://www.wxytools.com">"WXY Tools"</a> and all content in this plugin are &copy;2016-Present Clarence "exoboy" Bowman and <a href="http://www.wxytools.com">wxytools.com</a> and may not be altered or sold without prior written permission.</span>

<!-- page content ends here CLOSE --></div>
<!-- ============================= -->