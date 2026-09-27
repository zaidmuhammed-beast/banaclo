<?php
/**
 * Search form.
 *
 * @package econsco
 */
?>
<form role="search" method="get" class="search-form" action="<?php echo esc_url( home_url( '/' ) ); ?>">
	<label class="screen-reader-text" for="ec-search"><?php esc_html_e( 'Search for:', 'econsco' ); ?></label>
	<input type="search" id="ec-search" name="s" value="<?php echo esc_attr( get_search_query() ); ?>" placeholder="<?php esc_attr_e( 'Search articles…', 'econsco' ); ?>">
	<button type="submit" class="btn btn--primary"><?php esc_html_e( 'Search', 'econsco' ); ?></button>
</form>
