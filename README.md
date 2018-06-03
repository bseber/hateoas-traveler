# hateoas-traveler

javascript module to traverse a hateoas api

> disclaimer:
> * not production ready
> * not even close to be production ready
>
> just hacked for fun and this was part of the app

## Usage

```bash
npm install hateoas-traveler
```

fetching the root data:

```js
import hateoasTraveler from 'hateoas-traveler';

hateoasTraveler
    .from('http://example.url/api')
    .get()
    .then(data => console.log('successfully fetched data', data))
    .catch(error => console.error('failed to fetch data', error));
```

following to the next level:

```diff
import hateoasTraveler from 'hateoas-traveler';

hateoasTraveler
    .from('http://example.url/api')
+   .follow('search')
    .get()
    .then(data => console.log('successfully fetched data', data))
    .catch(error => console.error('failed to fetch data', error));
```

using templated link with query data:

```diff
import hateoasTraveler from 'hateoas-traveler';

hateoasTraveler
    .from('http://example.url/api')
-    .follow('search')
+    .follow('search', 'persons')
+    .withQueryData({ query: 'batman' })
    .get()
    .then(data => console.log('successfully fetched data', data))
    .catch(error => console.error('failed to fetch data', error));
```

do a POST:

```js
import hateoasTraveler from 'hateoas-traveler';

hateoasTraveler
    .from('http://example.url/api')
    .follow('persons')
    .post({ firstname: 'Bruce', lastname: 'Wayne'  })
    .then(data => console.log('successfully created person', data))
    .catch(error => console.error('failed to create person', error));
```

## TODOs

well... a ton of 🙊

* http verbs besides GET and POST
* path params
* templated links within a travelled path
* ...
