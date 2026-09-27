<?php
/**
 * Default page template.
 *
 * @package econsco
 */

get_header();

while ( have_posts() ) :
	the_post();
	econsco_page_hero( '', get_the_title() );
	?>
	<section class="section section--tight">
		<div class="container">
			<div class="prose prose--panel glass">
				<?php
				the_content();
				wp_link_pages();
				?>
			</div>
		</div>
	</section>
	<?php
	if ( comments_open() || get_comments_number() ) {
		echo '<div class="container prose">';
		comments_template();
		echo '</div>';
	}
endwhile;

get_footer();
