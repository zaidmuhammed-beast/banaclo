<?php
/**
 * Logo: the logo uploaded in Site Identity, or the built-in ECONSCO logo
 * (white wordmark version for the dark background).
 *
 * @package econsco
 */

if ( has_custom_logo() ) {
	echo '<div class="brand">';
	the_custom_logo();
	echo '</div>';
	return;
}
?>
<a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
	<img class="brand__logo" src="<?php echo esc_url( get_template_directory_uri() . '/assets/img/logo-light.png' ); ?>" width="426" height="111" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
</a>
