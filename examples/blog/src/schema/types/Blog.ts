import { intArg, mutationField, nonNull, objectType, queryField, stringArg } from 'nexus'

export const Blog = objectType({
  name: 'Blog',
  definition(t) {
    t.model.id()
    t.model.name()
    t.model.createdAt()
    t.model.updatedAt()
    t.model.posts({
      type: 'CustomPost',
      pagination: false,
      ordering: true,
      filtering: { title: true },
    })
    t.model.viewCount()
    t.model.authors()
  },
})

export const Mutation = mutationField((t) => {
  t.crud.createOneBlog()
})

export const Query = queryField((t) => {
  t.crud.blogMany({
    pagination: false,
  })
  t.crud.userMany({ filtering: true, alias: 'people' })
  t.crud.postMany({ type: 'CustomPost', ordering: true, filtering: true })
  //
  // Examples showing custom resolvers
  //

  t.field('blog', {
    type: 'Blog',
    args: {
      id: nonNull(intArg()),
    },
    resolve(_root, args, ctx) {
      return ctx.prisma.blog
        .findFirst({
          where: {
            id: args.id,
          },
        })
        .then((result) => {
          if (result === null) {
            throw new Error(`No blog with id of "${args.id}"`)
          }
          return result
        })
    },
  })

  t.list.field('blogsLike', {
    type: 'Blog',
    args: {
      name: stringArg(),
      viewCount: intArg(),
    },
    resolve(_root, args, ctx) {
      return ctx.prisma.blog.findMany({
        where: {
          name: args.name ?? undefined,
          viewCount: args.viewCount ?? undefined,
        },
      })
    },
  })
})
