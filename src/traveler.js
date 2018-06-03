import http from './http';
import flatten from './flatten';

const fromFactory = () => root => {
  return {
    follow: followFactory(root),
    get: getFactory(root),
  };
};

const followFactory = (...linksToFollow) => (...moreLinksToFollow) => {
  const links = [...flatten(linksToFollow), ...flatten(moreLinksToFollow)];
  return {
    withQueryData: withQueryDataFactory(links),
    get: getFactory(links),
    post: postFactory(links),
  };
};

const withQueryDataFactory = linksToFollow => queryData => {
  return {
    get: getFactory(linksToFollow, queryData),
  };
};

const getFactory = (linksToFollow, queryData) =>
  async function get() {
    const links = flatten(linksToFollow);
    let url = links.shift();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const data = await http.getJson(url);

      if (links.length === 0) {
        return data;
      }

      const follow = links.shift();
      const meta = data._links[follow];
      if (!meta) {
        throw new Error(
          `could not find linkToFollow=${follow} in links=${JSON.stringify(
            data._links,
          )}`,
        );
      }

      const href = meta.href;

      if (meta.templated) {
        if (links.length !== 0) {
          throw new Error(
            'only the last linkToFollow can be configured with params currently',
          );
        }
        if (!queryData) {
          throw new Error(
            `link="${href}" is templated but no queryData is given`,
          );
        }

        const missingParams = getMissingQueryDataParams(href, queryData);
        if (missingParams.length !== 0) {
          throw new Error(
            `link="${href}" requires parameters but "${missingParams.join(
              ',',
            )}" is undefined in queryData`,
          );
        }

        // TODO support queryData AND pathParams
        url = href.replace(/{.+}$/, '') + http.stringifyQuery(queryData);
      } else {
        url = href;
      }
    }
  };

const postFactory = linksToFollow =>
  async function post(payload) {
    const toFollow = linksToFollow.slice(0, linksToFollow.length - 1);
    const postIdentifier = linksToFollow[linksToFollow.length - 1];

    const get = getFactory(toFollow);
    const data = await get();

    const meta = data._links[postIdentifier];
    if (!meta) {
      throw new Error(
        `could not find linkToFollow=${postIdentifier} in links=${JSON.stringify(
          data._links,
        )}`,
      );
    }

    return http.postJson(meta.href, payload);
  };

function getMissingQueryDataParams(href, queryData) {
  const missingParams = [];
  href.replace(/{\?(.+)}$/g, (_, param) => {
    if (typeof queryData[param] === 'undefined') {
      missingParams.push(param);
    }
  });
  return missingParams;
}

export default {
  from: fromFactory(),
};
