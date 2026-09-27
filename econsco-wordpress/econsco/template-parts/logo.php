<?php
/**
 * Logo: the uploaded custom logo, or the built-in ECONSCO mark + wordmark.
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
	<svg class="brand__mark" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
		<path d="M4 4h32v32H4z" fill="#b6e21d"/>
		<path d="M4 4h12L36 24v12L4 4z" fill="#0b2238"/>
		<path d="M4 4l32 32" stroke="#b6e21d" stroke-width="3"/>
	</svg>
	<span class="brand__name"><?php bloginfo( 'name' ); ?></span>
</a>
