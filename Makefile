
publish:
	npm run build
	npm publish

publish-sync: publish
	cnpm sync dora
	tnpm sync dora

