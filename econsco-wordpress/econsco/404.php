<?php
/**
 * Not found.
 *
 * @package econsco
 */

get_header();
?>
<section class="section notfound">
	<div class="container">
		<div class="empty glass glass--strong">
			<p class="notfound__code">404</p>
			<h1 class="section-title"><?php esc_html_e( 'This page wandered off.', 'econsco' ); ?></h1>
			<p><?php esc_html_e( 'The page you are looking for does not exist or has moved.', 'econsco' ); ?></p>
			<a class="btn btn--primary" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Back to home', 'econsco' ); ?></a>
		</div>
	</div>
</section>
<?php
get_footer();
