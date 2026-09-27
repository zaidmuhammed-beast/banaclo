<?php
/**
 * Single post.
 *
 * @package econsco
 */

get_header();

while ( have_posts() ) :
	the_post();
	?>
	<article <?php post_class(); ?>>
		<header class="page-hero page-hero--post">
			<div class="container">
				<p class="eyebrow">
					<?php echo esc_html( get_the_date() ); ?>
					<?php
					$econsco_cats = get_the_category();
					if ( $econsco_cats ) {
						echo ' &middot; ' . esc_html( $econsco_cats[0]->name );
					}
					?>
				</p>
				<h1 class="page-hero__title"><?php the_title(); ?></h1>
			</div>
		</header>

		<?php if ( has_post_thumbnail() ) : ?>
			<div class="container">
				<figure class="post-cover glass"><?php the_post_thumbnail( 'large' ); ?></figure>
			</div>
		<?php endif; ?>

		<section class="section section--tight">
			<div class="container">
				<div class="prose prose--panel glass">
					<?php
					the_content();
					wp_link_pages();
					?>
				</div>
				<nav class="post-nav">
					<?php
					previous_post_link( '<span class="post-nav__prev">%link</span>', '&larr; %title' );
					next_post_link( '<span class="post-nav__next">%link</span>', '%title &rarr;' );
					?>
				</nav>
				<?php
				if ( comments_open() || get_comments_number() ) {
					echo '<div class="prose">';
					comments_template();
					echo '</div>';
				}
				?>
			</div>
		</section>
	</article>
	<?php
endwhile;

get_template_part( 'template-parts/cta' );
get_footer();
