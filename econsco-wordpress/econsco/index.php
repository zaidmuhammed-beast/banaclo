<?php
/**
 * Blog index, archives and search results.
 *
 * @package econsco
 */

get_header();

if ( is_home() ) {
	$econsco_title = get_option( 'page_for_posts' ) ? get_the_title( get_option( 'page_for_posts' ) ) : __( 'Insights', 'econsco' );
	econsco_page_hero( __( 'Blog', 'econsco' ), $econsco_title, __( 'Practical ideas on content, advertising and websites for growing businesses.', 'econsco' ) );
} elseif ( is_search() ) {
	/* translators: %s: search query */
	econsco_page_hero( __( 'Search', 'econsco' ), sprintf( __( 'Results for “%s”', 'econsco' ), get_search_query() ) );
} elseif ( is_archive() ) {
	econsco_page_hero( __( 'Archive', 'econsco' ), wp_strip_all_tags( get_the_archive_title() ), wp_strip_all_tags( get_the_archive_description() ) );
} else {
	econsco_page_hero( '', get_bloginfo( 'name' ) );
}
?>

<section class="section section--tight">
	<div class="container">
		<?php if ( have_posts() ) : ?>
			<div class="grid grid--3">
				<?php
				while ( have_posts() ) {
					the_post();
					get_template_part( 'template-parts/card-post' );
				}
				?>
			</div>
			<div class="pagination">
				<?php
				the_posts_pagination(
					array(
						'mid_size'  => 1,
						'prev_text' => __( 'Previous', 'econsco' ),
						'next_text' => __( 'Next', 'econsco' ),
					)
				);
				?>
			</div>
		<?php else : ?>
			<div class="empty glass">
				<h2><?php esc_html_e( 'Nothing here yet.', 'econsco' ); ?></h2>
				<p><?php esc_html_e( 'New articles are on the way. In the meantime, try a search.', 'econsco' ); ?></p>
				<?php get_search_form(); ?>
			</div>
		<?php endif; ?>
	</div>
</section>

<?php
get_template_part( 'template-parts/cta' );
get_footer();
