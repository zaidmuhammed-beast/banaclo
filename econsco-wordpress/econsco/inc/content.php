<?php
/**
 * Site copy that the templates render. Edit here to change wording site-wide.
 *
 * @package econsco
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Pages created on theme activation. Each slug has a matching page-{slug}.php template.
 */
function econsco_pages() {
	return array(
		'home'     => array( 'title' => __( 'Home', 'econsco' ), 'in_menu' => false ),
		'services' => array( 'title' => __( 'Services', 'econsco' ), 'in_menu' => true ),
		'work'     => array( 'title' => __( 'Work', 'econsco' ), 'in_menu' => true ),
		'about'    => array( 'title' => __( 'About', 'econsco' ), 'in_menu' => true ),
		'blog'     => array( 'title' => __( 'Insights', 'econsco' ), 'in_menu' => true ),
		'contact'  => array( 'title' => __( 'Contact', 'econsco' ), 'in_menu' => true ),
	);
}

function econsco_services() {
	return array(
		array(
			'id'      => 'content-marketing',
			'icon'    => 'pen',
			'title'   => __( 'Content Marketing', 'econsco' ),
			'summary' => __( 'Content that earns attention, builds trust and turns readers into customers — planned around what your buyers actually search for.', 'econsco' ),
			'points'  => array(
				__( 'Content strategy and editorial calendar', 'econsco' ),
				__( 'SEO articles, landing pages and guides', 'econsco' ),
				__( 'Social media content and short-form video', 'econsco' ),
				__( 'Email newsletters and nurture sequences', 'econsco' ),
			),
		),
		array(
			'id'      => 'advertising',
			'icon'    => 'target',
			'title'   => __( 'Advertising', 'econsco' ),
			'summary' => __( 'Paid campaigns that reach the right people at the right moment, with every euro, pound and rupiah tracked back to results.', 'econsco' ),
			'points'  => array(
				__( 'Google Search, Display and YouTube Ads', 'econsco' ),
				__( 'Meta (Facebook & Instagram) and TikTok Ads', 'econsco' ),
				__( 'LinkedIn Ads for B2B lead generation', 'econsco' ),
				__( 'Conversion tracking, testing and reporting', 'econsco' ),
			),
		),
		array(
			'id'      => 'web-development',
			'icon'    => 'code',
			'title'   => __( 'Website Development', 'econsco' ),
			'summary' => __( 'Fast, secure websites and online stores designed to convert — built to grow with your business rather than hold it back.', 'econsco' ),
			'points'  => array(
				__( 'Business websites and landing pages', 'econsco' ),
				__( 'WordPress and WooCommerce stores', 'econsco' ),
				__( 'UI/UX design and conversion optimisation', 'econsco' ),
				__( 'Speed, security, hosting and maintenance', 'econsco' ),
			),
		),
	);
}

function econsco_supporting_services() {
	return array(
		array( 'icon' => 'search', 'title' => __( 'SEO', 'econsco' ), 'text' => __( 'Technical, on-page and local SEO that compounds month after month.', 'econsco' ) ),
		array( 'icon' => 'spark', 'title' => __( 'Branding', 'econsco' ), 'text' => __( 'Logos, visual identity and brand voice that make you memorable.', 'econsco' ) ),
		array( 'icon' => 'chart', 'title' => __( 'Analytics', 'econsco' ), 'text' => __( 'Dashboards and tracking so you always know what is working.', 'econsco' ) ),
		array( 'icon' => 'chat', 'title' => __( 'Social Media', 'econsco' ), 'text' => __( 'Community management that keeps your audience engaged.', 'econsco' ) ),
	);
}

function econsco_process() {
	return array(
		array( 'title' => __( 'Discover', 'econsco' ), 'text' => __( 'We learn your business, customers, competitors and goals, then audit what you already have.', 'econsco' ) ),
		array( 'title' => __( 'Plan', 'econsco' ), 'text' => __( 'A clear growth plan: which channels, what budget, which numbers we will move and by when.', 'econsco' ) ),
		array( 'title' => __( 'Build & launch', 'econsco' ), 'text' => __( 'We create the content, campaigns and website, then launch with tracking in place from day one.', 'econsco' ) ),
		array( 'title' => __( 'Measure & scale', 'econsco' ), 'text' => __( 'Monthly reporting in plain language. We double down on what works and cut what does not.', 'econsco' ) ),
	);
}

function econsco_reasons() {
	return array(
		array( 'title' => __( 'One team, every channel', 'econsco' ), 'text' => __( 'Content, ads and web built by one team, so your message and data line up everywhere.', 'econsco' ) ),
		array( 'title' => __( 'Results you can see', 'econsco' ), 'text' => __( 'Clear KPIs and honest reports — leads, sales and cost per result, not vanity metrics.', 'econsco' ) ),
		array( 'title' => __( 'Built to scale', 'econsco' ), 'text' => __( 'Systems and assets that keep working as you grow, not one-off campaigns.', 'econsco' ) ),
		array( 'title' => __( 'Straight talk', 'econsco' ), 'text' => __( 'Transparent pricing, direct access to the people doing the work, no lock-in.', 'econsco' ) ),
	);
}

function econsco_values() {
	return array(
		array( 'title' => __( 'Growth first', 'econsco' ), 'text' => __( 'Every piece of work has to earn its place by moving a number that matters to you.', 'econsco' ) ),
		array( 'title' => __( 'Craft', 'econsco' ), 'text' => __( 'We sweat the details — the headline, the load time, the audience setting.', 'econsco' ) ),
		array( 'title' => __( 'Transparency', 'econsco' ), 'text' => __( 'You own your accounts, your data and your website. Always.', 'econsco' ) ),
		array( 'title' => __( 'Partnership', 'econsco' ), 'text' => __( 'We work as an extension of your team, not a vendor you chase for updates.', 'econsco' ) ),
	);
}

/**
 * Example engagements shown on the Work page until real case studies are published
 * as posts in the "Case Studies" category.
 */
function econsco_example_work() {
	return array(
		array( 'tag' => __( 'Website + Ads', 'econsco' ), 'title' => __( 'E-commerce launch', 'econsco' ), 'text' => __( 'A WooCommerce store paired with Meta and Google Shopping campaigns to drive first sales.', 'econsco' ) ),
		array( 'tag' => __( 'Content', 'econsco' ), 'title' => __( 'B2B content engine', 'econsco' ), 'text' => __( 'An SEO blog and LinkedIn content programme that generates inbound leads every month.', 'econsco' ) ),
		array( 'tag' => __( 'Ads', 'econsco' ), 'title' => __( 'Local lead generation', 'econsco' ), 'text' => __( 'Search and social campaigns with landing pages built to turn clicks into booked calls.', 'econsco' ) ),
	);
}

/**
 * Offices shown in the "Where we operate" section, footer and contact page.
 */
function econsco_locations() {
	return array(
		array( 'flag' => 'es', 'city' => __( 'Jaén', 'econsco' ), 'country' => __( 'Spain', 'econsco' ), 'tz' => 'Europe/Madrid' ),
		array( 'flag' => 'id', 'city' => __( 'Jakarta', 'econsco' ), 'country' => __( 'Indonesia', 'econsco' ), 'tz' => 'Asia/Jakarta' ),
		array( 'flag' => 'gb', 'city' => __( 'Belfast', 'econsco' ), 'country' => __( 'United Kingdom', 'econsco' ), 'tz' => 'Europe/London' ),
	);
}
