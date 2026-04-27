import type { DiscoverData, FeedData, NotificationItem, Post, Story, User } from '../types';

export const ME: User = {
  id: 'me',
  name: '埃琳娜·罗德里格斯',
  username: '@elenar_designs',
  avatar:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDb9cZPcT5y0ZFGbE9BhXJmU1nex9j1nQ4DD0LA4sZch6BZXiD4fFEar888oqe7iOMLkJiWLUYenRQPGW5AZzUvc0Mt1piGVG_w-6OTKfoUmlqcPeOlmVzccH3QS3nvCFo321_jDFGTqXxIikTTzFgOQyUBNx9dc-UM8oWc0dw-3u4IYvFApL9Q8lc_j1ZhFmE9Kk3dCLrom2mpf2b1WuQvUii9ULcncWH1vlOm9oiVD5H1SzoGDAez9m9WOySN-t2l_DqFfcYZNib-',
  bio: '数字艺术家与交互设计师，专注于流体运动、海洋色调与叙事型界面。',
  stats: {
    posts: 142,
    followers: 12400,
    following: 892,
  },
};

export const MOCK_USERS: Record<string, User> = {
  elena: {
    id: 'elena',
    name: 'Elena Rivera',
    username: '@elena_r',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBEHAelWm2mk1quCH2-jOC2zF7KoeqJ2hjZTfqUFzorCTN8JEfjvX1x4DyDmAMGdKRFDxtTkPDBVmzaVBvOFaLSMx1662hvWteMUXVTwOcb6g80eFKKtWoUVkIQF-FnWSjsBQ9ktfuBd3NKeDWT-9sXh2kdLlDWkc3zcFoQu7pNVbRQ7pbVhvGrrelo4pA3wwDpl7yP812HQznix_MDVdRkgE3SpTCshz5zUsBa8CyF0l4fhuywNtv1f-6pK78OzSmm3aop-TDu7Fdo',
    viewerIsFollowing: true,
  },
  marcus: {
    id: 'marcus',
    name: 'Marcus Chen',
    username: '@marcus_c',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuClYz1lSznVq9scazeeI_NdHZCRvQds0Vr3zrZmLmZWKIrk_tgjVKAJT-HxGA0Va391icGM_CS7Z7yCmjjbfXfe_uBAs0-imqHEyWO7yfFfijL0EIHel8aQciDteCieGobiZ37T4F_PTHGoDf_LBiCPwnMBmPL14obJIBe5WWoX1nRop928uV5V4SQqwxDOHRZj0Z533eQq-yFw1Yb4mA7TfbvhzUvpMnNM4Xx-QkHX4LUINLgdqN8zaLepju-SYtaSIVBPU493y1WQ',
    viewerIsFollowing: false,
  },
  sarah: {
    id: 'sarah',
    name: 'Sarah Jenkins',
    username: '@sarah_j',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBlRBdh23B4RWAWU7WyCEFIwgrkHo-jHytXYcqC_d-bhOAv9G-q9chOUegIdrUQ5mbgPtx1egIcGainFYWTCX-1JkTfGR_HJV7ZY5q5cBeIc9_KPDtHHurr8lLgX-RkoAwb1pPEkjdpW-KwHQUiYmALG9W-q6CoGjGnNKXGiDj867G1KXOSMW1RobGYUOyFgiyrHr5bbzc46DD6lB2F4hkDqSg_10eZGLyCvRH-ltgI_Hox4uTgowTP7Z3qXrETBE3OccSMJEkS6vQN',
    viewerIsFollowing: true,
  },
};

export const STORIES: Story[] = [
  { id: 'me-story', user: ME, isMe: true },
  { id: '1', user: MOCK_USERS.elena },
  { id: '2', user: MOCK_USERS.marcus },
  { id: '3', user: MOCK_USERS.sarah },
];

export const POSTS: Post[] = [
  {
    id: 'post-1',
    author: MOCK_USERS.elena,
    content: '在平凡中发现奇迹。夕阳洒在教堂上的那一刻，简直如梦似幻。',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDwLkuD-3t_t2En54fn_NnaNWqgccqaOHPPu_s3nHlJ0XxP42tu03lSgMQ-8wRNjKGh_MK8hYw7DxVumVJZr_T6fAGAmPwXH0Ulq1RTblkGJEzwqoMDYokxqeXGtoYD-FmaaQlkunqYapfd25hza_yy_FT4AeFOJr8TOQje8x2O9uhiUdGNiV_DbxPj_cd41Ie0lQjLWacbzI4VvraXvVchet0OxY_vo7Cdh_VUqAkBzoHg593nCXQyEhPCJVUqxGeyw_1SgsBUDL5C',
    timestamp: '2 小时前',
    createdAt: '2026-04-16T10:00:00.000Z',
    likes: 1200,
    comments: 48,
    visibility: 'public',
    tags: ['photography', 'sunset'],
    location: 'Lisbon',
  },
  {
    id: 'post-2',
    author: MOCK_USERS.marcus,
    content: '创新不在于与众不同，而在于以最自然的方式改变生活。',
    timestamp: '5 小时前',
    createdAt: '2026-04-16T07:00:00.000Z',
    likes: 842,
    comments: 12,
    type: 'quote',
    visibility: 'public',
    tags: ['thinking', 'design'],
  },
  {
    id: 'post-3',
    author: MOCK_USERS.sarah,
    content: '周末随记。京都的小巷像一场安静又明亮的梦。',
    timestamp: '昨天',
    createdAt: '2026-04-15T09:00:00.000Z',
    likes: 2500,
    comments: 156,
    type: 'gallery',
    visibility: 'followers',
    tags: ['travel', 'kyoto'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAJ0JA66JXdpBFT25Bcgb3Hf0EIKh0yYgGLwVytEUbqkSV43g6Xg1a81d6odeDo13K4qCpPabEAXlWycz9g-gOGD_KknFTgSi2KkTRpzO0W5T8fwdm75IE_tCt_UBblssLbhUMYEKvfpoXK_JQI6Xjt8VfVIfUHaeaXTDaMTSfpdQWhGDlmz9oLZvTCJdAlbNHs56IbYn1abizpgjvCEutdK9Loqvrsv4JHAJlfQn4wdHl_gigCwH34wW0zWHGNvq8u8PReRCyP2pYj',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD_ExS8s56QMRTghZWvKP48GdrB0QLcZ7aOSosBNMGE8ydHYc_op4CjkRH1c0eVgg8hlQygLPlpIMJLUTdC00jK5L3g0WlIt_r6Q8QjmtUmQM1NnhV9KiC35e4QALcpewvYz93bv8eY6ZIp1W8plppWBJBMW-Au-tDW8NT2vtTs_IRQ2smurr-xqD7H9jlhjzb7Ru-DQwqnApz2-7KA2J_OUrE9_3oRZdCvIHKMGRHCe0dHS53272AsV3cQIBCBw4wUMPKsnPEK2Vk0',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC8zfHgdRXIj-SBAgseHLt-8dkkV3vDcaEwwx-vArp31__Y-ar-n731NQLzVvO318PF62Yg_Vys9ah1NyEuyl90-XjbQMPWVrD93fSfjBBx6FKPyxFG4o6zdQ72qYzwWpWSkIt-b-SoMrp1juFb0FqkrnktcW5bOqC31YDbolPETs27AFSlcBaQzdNIPjTVyxVYpnqVcE4eC9B1M5DcTnp4AWkPsFiHxAsQITFyRpZ7cKgxYOfS9oTIzA8such_qiE77akPifmQQWKq',
    ],
  },
];

export const DISCOVER_DATA: DiscoverData = {
  hero: {
    title: '幻蓝之巅：蓝调时刻系列',
    subtitle: '热门摄影',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCvT5S8hwZzxQociGzvPbCzKx_nilGJ7FNu4WEPzx5eYfUVJwMajMdp9j1fEOpoZrHMYY3CCjajqbXXEUYiwTZusYOT9hR--oTMTYQzYJzKUttrErNNVElquWA2PIa9wGY6wknDcKhW3YA1dxYdwQVO0pFaQWNxGYNt8dFFteBa2aieUWFoaDDNqiSrb6R8kXk7OGHdOmd4hOeyRC_RIVdFUGutVlolggi5IKfSiRvP-M23afFkf7dHLr8IJT14vYZW9Khzm-P3Rf9W',
  },
  categories: ['FOR_YOU', 'PHOTO_GRA', 'TECH_EXP', 'LIFESTYLE', 'DESIGN_UX'],
  galleries: [
    {
      id: 'gallery-1',
      title: 'Gallery_ID: 0001',
      likes: 1200,
      category: 'FOR_YOU',
      image: 'https://picsum.photos/seed/pulse-1/800/450',
    },
    {
      id: 'gallery-2',
      title: 'Gallery_ID: 0002',
      likes: 2400,
      category: 'PHOTO_GRA',
      image: 'https://picsum.photos/seed/pulse-2/800/450',
    },
    {
      id: 'gallery-3',
      title: 'Gallery_ID: 0003',
      likes: 3600,
      category: 'DESIGN_UX',
      image: 'https://picsum.photos/seed/pulse-3/800/450',
    },
  ],
};

export const PORTFOLIO_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBbW6kOWA-uLSewnhGpNHO5GrC9X_5HBSJf65BTfy01EX-fYGmr7UgV8-HS-Rp7xzI3R7fnBH5u0TyFYg6DFQWhrbacSTHMBYoRPXnQEYEc47dttwQRBJKowzHPWLF_nFE7HhBkGIj-5ngZvTWximPbL6X4jKApEEFBYs6v1eoXzv56zZ01wLkqILDPvO2J7iWz8uT_XBCGEwpFVW-fL9KZ58s2FTnI4JxGpceJK1pqpxazYsPTEWanEJKRvUJcB-vrAI6AO1dK81Tu',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBK_WiRW2tmlkagPedeWHFZvM3osXgauifGYPDOnZ0u7mOOvy_npUcsn-DIE3MO_JSYU-_7nnkmsDuKYOiQr-8tb-uNe6XA88fgUmAH4Z_DyD1EwFD5udUR9kXLrpURLyM2CddD3WOCIGJBCXrCQJaUfYpVpOtNcu_bj2XxaA3UPjVtP9FendvMipkah8p-zlct4-GM7NEBXyYPtBu33qe20V4KGYtYQSk4f4xwvrPgDEmkimVqhd1PITr1_pRMmeMXo7h2FqS78Ba0',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBLysDPj7rFkBCfTJqqtTb23_mdu9AzdeGaClyYxrHEEyU4D-l3ijmbewUM7kjcHZbqHTnsjMD6ug2xD_3a-BY7606BK10Kvx42A-p2h0QTaNEROCJidCCvp47XC9TySJCwBy_uQGVeAv-6JBrqx_MQub1gIhw_Ua7JNblcLYRB-Hc_zgjRXj_ghhUmDbd42_Py4PLdTQGyDx1UDuVd6b0_xg-CzMkOGkbrxRrdgEcUvAiQpKpGSrBCCrs555vhdqMmBKgvZjUMwS4t',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAbuVenJpbAp2OnQk9kSpuFvdcFaTpCwxBs8xu_ohEjzTiHHpkCbms_a1GpHB8lsLFBMsBZHsQjAwRPyOOuzWrItb6FswNun88WlpDYGmN3mQaMghKjdDyHKev703y20b6Zgw63DBiDlmeRyltrPVi2KtPJAdvL0q-S0DoJMpgzRCWFXmnDQfOWJW6Myh2pQnQT4apBOwr-PGKVLZLtxer4pLTDhW-nPzqx_9_vSWkQ6LgiFdhkcDTmq37kw0Z2YWxjN9bXr9IqBD2D',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCiuS-oeGeGI4uYHc31SWOT6LyzybZv1tyPoxyQNrDQ7m6Jo9-86g7O-cuh2bTEMlt7eieX3jStwqIhTLcGb8kGn59DKw7_rtTqBDRYZrRD6MFUMnyxOkduSnM5Z3Mu-1oDxCdg-2wdLBL_Q-6y7yZ-pYrDsTJk46oNc8sI7CsLHU9c2DJiHogYb_SVS6Nv0z3wqrav8v_c-RDB49_43OcUIif_gk1oyckfBEuKGS2WcnuMs2D3eSyPa6O72XUlvcKcBUzy_LlFIdn4',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBQf8fojwgGLn1vomMInOOivPhtkWUgzLUEZFB5kL34NMz3utkINyC9GQNamsOGXS6xYkp5y0yxfBYmGG_BA9N0IYrJMAtRsBnl0l0oT1yxioG8lK2iRl7NyrZPTQLRQFQS6jCRJtd9dPlRZPa6gs-QAfCl0VuTlx4Qq3k1PKctVFMgBctW0seSKWI1UwVkOkw8msgBqU2BDD50bnhUJkNygKmYzqGYhr1h2Zzd4tiqz61TmvMTeOJEFMgkZoMcPIGoFp6GnBhSuYL2',
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notice-1',
    type: 'profile_follow',
    actor: MOCK_USERS.elena,
    message: '开始关注你，后续会优先看到你的新动态。',
    isRead: false,
    createdAt: '2026-04-26T10:00:00.000Z',
    timestamp: '2 小时前',
  },
  {
    id: 'notice-2',
    type: 'post_comment',
    actor: MOCK_USERS.marcus,
    postId: 'post-1',
    postPreview: '在平凡中发现奇迹。夕阳洒在教堂上的那一刻...',
    message: '评论了你的动态：光影层次太舒服了，像一张电影剧照。',
    isRead: false,
    createdAt: '2026-04-26T09:20:00.000Z',
    timestamp: '3 小时前',
  },
  {
    id: 'notice-3',
    type: 'post_like',
    actor: MOCK_USERS.sarah,
    postId: 'post-2',
    postPreview: '创新不在于与众不同，而在于以最自然的方式改变生活。',
    message: '点赞了你的动态，正在为这条观点带来更多曝光。',
    isRead: true,
    createdAt: '2026-04-25T20:10:00.000Z',
    timestamp: '昨天',
  },
];

export const MOCK_FEED: FeedData = {
  me: ME,
  stories: STORIES,
  posts: POSTS,
  discover: DISCOVER_DATA,
  portfolioImages: PORTFOLIO_IMAGES,
  notifications: NOTIFICATIONS,
  unreadNotificationCount: NOTIFICATIONS.filter((item) => !item.isRead).length,
  source: 'mock',
};
