<?php
/**
 * Work page (slug: work). Lists posts in the "Case Studies" category; until any
 * exist it shows example engagements, labelled as examples.
 *
 * @package econsco
 */

get_header();
econsco_page_hero(
	__( 'Our work', 'econsco' ),
	__( 'Growth stories.', 'econsco' ),
	__( 'A look at how we combine content, advertising and web development to move the numbers that matter.', 'econsco' )
);

$econsco_cases = new WP_Query(
	array(
		'category_name'       => 'case-studies',
		'posts_per_page'      => 12,
		'ignore_sticky_posts' => true,
	)
);
?>

<section class="section section--tight">
	<div class="container">
		<?php if ( $econsco_cases->have_posts() ) : ?>
			<div class="grid grid--3">
				<?php
				while ( $econsco_cases->have_posts() ) {
					$econsco_cases->the_post();
					get_template_part( 'template-parts/card-post' );
				}
				wp_reset_postdata();
				?>
			</div>
		<?php else : ?>
			<div class="grid grid--3">
				<?php foreach ( econsco_example_work() as $index => $item ) : ?>
					<article class="work-card glass reveal" style="--delay: <?php echo esc_attr( $index * 80 ); ?>ms">
						<div class="work-card__art" aria-hidden="true"><span><?php echo esc_html( $item['tag'] ); ?></span></div>
						<p class="post-card__meta"><?php esc_html_e( 'Example engagement', 'econsco' ); ?></p>
						<h2 class="post-card__title"><?php echo esc_html( $item['title'] ); ?></h2>
						<p><?php echo esc_html( $item['text'] ); ?></p>
					</article>
				<?php endforeach; ?>
			</div>
			<?php if ( current_user_can( 'edit_posts' ) ) : ?>
				<p class="admin-hint"><?php esc_html_e( 'Only you can see this: publish posts in the “Case Studies” category and they will replace these examples.', 'econsco' ); ?></p>
			<?php endif; ?>
		<?php endif; ?>
	</div>
</section>

<?php
econsco_page_editor_content();
get_template_part( 'template-parts/cta' );
get_footer();
