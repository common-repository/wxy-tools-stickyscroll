<?php 
/*
	Plugin Name: WXY Tools Stickyscroll
	Plugin URI: http://www.wxytools.com
	Description: Restores scrollbar positions to any area in the admin panel after a page refresh event. Save values for all the areas you visit in a session. There is also a mousewheel shortcut to snap to the top of the page, just flick the mousehweel up 3 times quickly.
	Version: 0.0.5
	Author: Clarence "exoboy" Bowman
	Author URI: http://www.wxytools.com
	License: GPL2
*/

// ***********************************************************************
// plugin version
// ***********************************************************************
$wxy_tools_stickyscroll_jal_db_version = '0.0.5';

// ***********************************************************************
// do these items when this plugin is ACTIVATED
// ***********************************************************************
register_activation_hook( __FILE__, 'wxy_tools_stickyscroll_activation');

function wxy_tools_stickyscroll_activation()
{
	// ------------------------------------------------------
	//do nothing on activation
	// ------------------------------------------------------
};

// ***********************************************************************
// do these items when this plugin is DE-ACTIVATED
// ***********************************************************************
register_deactivation_hook( __FILE__, 'wxy_tools_stickyscroll_deactivation');

function wxy_tools_stickyscroll_deactivation()
{
	// ------------------------------------------------------
	// do nothing on de-activation
	// ------------------------------------------------------

};


// ***********************************************************************
// do these items when this plugin is UN-INSTALLED
// ***********************************************************************
register_uninstall_hook ( __FILE__, 'wxy_tools_stickyscroll_uninstall' );

function wxy_tools_stickyscroll_uninstall()
{
	// ------------------------------------------------------
	// do nothing on uninstall
	// ------------------------------------------------------
};

// ***********************************************************************
// load our external JS - but only in admin area
// ***********************************************************************
if( is_admin() )
{
	add_action( 'admin_enqueue_scripts', 'wxy_tools_stickyscroll_scripts' );
}

function wxy_tools_stickyscroll_scripts()
{
	wp_enqueue_script('wxy_tools_stickyscroll_scripts', plugins_url('js/wxy-tools-stickyscroll-scripts.js', __FILE__), array("jquery"), '0.0.1', true );
}

// ***********************************************************************
// pass values to javascript - ONLY in admin
// ***********************************************************************
if( is_admin() )
{
	add_action( 'admin_enqueue_scripts', 'wxy_tools_stickyscroll_send_to_js' );
}

function wxy_tools_stickyscroll_send_to_js()
{	
	// be sure we are in the admin section
	global $wxy_tools_stickyscroll_jal_db_version;
		
	// -------------------------------------------------------
	// get info about our current SCREEN
	// to save it's scroll top value in a client-side cookie
	// -------------------------------------------------------
	try {
		if( function_exists( 'get_current_screen' ) )
		{
			$this_screen = get_current_screen();
		}
	} catch(Exception $e) {}

	// -------------------------------------------------------
	// get our current POST/PAGE
	// to save it's scroll top value in a client-side cookie
	// -------------------------------------------------------
	try {
		if( function_exists( 'get_post' ) )
		{	
			$this_post["ID"] = get_the_ID();
			$this_post["title"] = get_the_title( $this_post["ID"] );
			$this_post["type"] = get_post_type( $this_post["ID"] );
		}
	} catch(Exception $e) {}
		
	// -------------------------------------------------------
	// now add our post object to one big object
	// -------------------------------------------------------
	$admin_info = array();
		
	if( isset( $this_screen ) && $this_screen != NULL )
	{
		$admin_info["screen"] = $this_screen;
	}
		
	if( isset( $this_post ) && $this_post != NULL )
	{
		$admin_info["post"] = $this_post;
	}
		
	// now convert our result object into JSON
	$panel_info = json_encode( $admin_info );
		
 	// add our screen info
	$data["admin_panel_info"] = $panel_info;
	
	// now get our session id
	$session_id = session_id();
	$data["session_id"] = $session_id;
		
	// now get our site url to use as a cookie suffix
	$site_name = get_bloginfo( 'url', 'raw' );
	$site_name = str_replace( "http://", "", $site_name );
	$site_name = preg_replace( "/[^a-zA-Z0-9]/", " ", $site_name);
	$site_name = str_replace( " ", "_", $site_name );
	
	$data["site_name"] = $site_name;
	
	// now add the path to the plugin and the home path for the site (in case it is installed in a different folder thabn root)
	$data["site_plugins_path"] = plugins_url('', __FILE__ );
	
	if( function_exists( 'get_home_path' ) )
	{
		$data["site_home_path"] = get_home_path();
	} else {
		$data["site_home_path"] = ABSPATH;
	}
		
	// get our version
	$data["version_number"] = $wxy_tools_stickyscroll_jal_db_version;
		
	// get our current username...
	$current_user = wp_get_current_user();
	$data["active_user_login"] = $current_user->user_login;
		
	// get an array of ALL usernames...
	$raw_users = get_users( array( 'fields' => array( 'user_login' ) ) );
	$all_users = array();
		
	// Array of stdClass objects.
	foreach ( $raw_users as $user ) {
		array_push( $all_users, esc_html( $user->user_login ) );
	}
		
	$data["all_user_logins"] = $all_users;
			
	// ------------------------------------------------------------------------------------
	// capture our last login time to see if ths is the first time they have logged in...
	// ------------------------------------------------------------------------------------
	$last_login = get_user_meta( $current_user->ID , '_last_login', true);
	$current_time = time();
	
	try {
		$diff = intval( $current_time ) - intval( $last_login );
	} catch (Exception $e)
	{
		$diff = 0;	
	}
			
	$data["initial_login"] = "false";
	if( $diff < 10 )
	{
		$data["initial_login"] = "initial_login";
	}
	
	// ---------------------------------------------------------
	// ADD OUR OPTIONS
	// ---------------------------------------------------------
	$autosave = esc_attr( get_option('wxy_tools_stickyscroll_autosave') );
	$interval = esc_attr( get_option('wxy_tools_stickyscroll_interval') );
	
	$data["autosave"] = isset( $autosave ) ? $autosave : 0;
	$data["interval"] = isset( $internval ) ? $interval : 0;

	// the location of our javascript for the plugin
	$javascript = plugins_url('', __FILE__ ) . '/js/wxy-tools-stickyscroll-scripts.js';
	
	// register our script, localize it, then enqueue it
	wp_register_script( 'wxy-stickyscroll-ajax-js', $javascript, array( 'jquery' ), $wxy_tools_stickyscroll_jal_db_version, true );
	wp_localize_script( 'wxy-stickyscroll-ajax-js', 'wxy_sticky_scroll_admin_vars', $data );
	wp_enqueue_script( 'wxy-stickyscroll-ajax-js' );

};

// ***********************************************************************
// ADD our settings and help page...
// ***********************************************************************
add_action('admin_menu', 'wxy_tools_stickyscroll_plugin_create_menu');

function wxy_tools_stickyscroll_plugin_create_menu() {

	//create new top-level menu
	//add_menu_page('My Cool Plugin Settings', 'Cool Settings', 'administrator', __FILE__, 'my_cool_plugin_settings_page' , plugins_url('/images/icon.png', __FILE__) );
	add_options_page('WXY Tools Stickyscroll > Settings', 'WXY Tools Stickyscroll', 'administrator', 'wxy_tools_stickyscroll_settings_page' , 'wxy_tools_stickyscroll_settings_page' );

	//call register settings function
	//add_action( 'admin_init', 'register_wxy_tools_stickyscroll_settings' );
	add_action( 'admin_init', 'register_wxy_tools_stickyscroll_settings' );

}

// OPTIONS-CONTROL PANE: this is where all the user-facing controls are...
function wxy_tools_stickyscroll_settings_page()
{
	// include our external file
	include( "options/wxy-tools-stickyscroll-options-page.php" );
}

// register our options to save so the system can filter out extraneous data if sent to the server on POST's
function register_wxy_tools_stickyscroll_settings() {
	//register our settings
	register_setting( 'wxy-tools-stickyscroll-settings-group', 'wxy_tools_stickyscroll_autosave' );
}


?>