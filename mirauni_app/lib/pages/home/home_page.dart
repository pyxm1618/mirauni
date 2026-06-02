import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/constants.dart';
import '../../widgets/common/brutalist_card.dart';

/// 首页
class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            // TODO: 刷新数据
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // "SHIP FASTER" Label
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.accent,
                    border: Border.all(color: Colors.black, width: 3),
                    boxShadow: const [
                       BoxShadow(
                         color: Colors.black,
                         offset: Offset(4, 4),
                         blurRadius: 0,
                       )
                    ],
                  ),
                  transform: Matrix4.rotationZ(-0.03), 
                  child: const Text(
                    '🚀 SHIP FASTER',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      color: Colors.black,
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // Hero Title
                const Text(
                  'BUILD.',
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.w900,
                    height: 1.0,
                    color: Colors.black,
                  ),
                ),
                // Using underline instead of expensive stroke paint
                Text(
                  'CONNECT.',
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.w900,
                    height: 1.0,
                    color: AppColors.secondary,
                    decoration: TextDecoration.underline,
                    decorationColor: AppColors.secondary,
                    decorationThickness: 3,
                  ),
                ),
                const Text(
                  'LAUNCH.',
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.w900,
                    height: 1.0,
                    color: Colors.black,
                  ),
                ),
                
                const SizedBox(height: 32),
                
                // Description Box
                Container(
                   padding: const EdgeInsets.all(16),
                   decoration: const BoxDecoration(
                     color: Colors.white,
                     border: Border(left: BorderSide(color: Colors.black, width: 4)),
                     boxShadow: [
                        BoxShadow(
                          color: Colors.black,
                          offset: Offset(4, 4),
                          blurRadius: 0,
                        )
                     ],
                   ),
                   child: const Text(
                     'Access the underground network of independent developers. No suits. Just code.',
                     style: TextStyle(
                       fontSize: 16,
                       fontWeight: FontWeight.bold,
                       color: Colors.black,
                     ),
                   ),
                ),

                const SizedBox(height: 40),

                // Action Buttons (Simplified for performance)
                GestureDetector(
                  onTap: () {
                    // TODO: 发布项目
                  },
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      border: Border.all(color: Colors.black, width: 3),
                      boxShadow: const [
                        BoxShadow(color: Colors.black, offset: Offset(4, 4), blurRadius: 0)
                      ],
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'START PROJECT',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                GestureDetector(
                  onTap: () => context.go('/developers'),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: Colors.black, width: 3),
                      boxShadow: const [
                        BoxShadow(color: Colors.black, offset: Offset(4, 4), blurRadius: 0)
                      ],
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'BROWSE TALENT',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                    ),
                  ),
                ),

                const SizedBox(height: 48),

                // Fresh Drops (Projects) Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                     Container(
                       decoration: const BoxDecoration(
                         border: Border(bottom: BorderSide(color: Colors.black, width: 4)),
                       ),
                       padding: const EdgeInsets.only(bottom: 8),
                       child: const Text(
                         'FRESH DROPS',
                         style: TextStyle(
                           fontSize: 24,
                           fontWeight: FontWeight.w900,
                           color: Colors.black,
                         ),
                       ),
                     ),
                     InkWell(
                       onTap: () => context.go('/projects'),
                       child: const Padding(
                         padding: EdgeInsets.only(bottom: 8),
                         child: Text(
                           'SEE ALL ->',
                           style: TextStyle(
                             fontWeight: FontWeight.bold,
                             decoration: TextDecoration.underline,
                             decorationThickness: 2,
                           ),
                         ),
                       ),
                     ),
                  ],
                ),
                const SizedBox(height: 24),

                // Project Cards (Mock Data for now, later integrate with provider)
                _buildProjectCard(
                  title: 'E-COM ANALYTICS',
                  description: 'Real-time dashboard. Sales tracking. Big Data.',
                  tags: ['VUE', 'D3', 'NODE'],
                  author: 'S',
                  authorColor: AppColors.primary,
                  likes: 128,
                ),
                const SizedBox(height: 16),
                _buildProjectCard(
                  title: 'MINDFUL APP',
                  description: 'Breathe in. Breathe out. Code better.',
                  tags: ['REACT', 'FASTAPI'],
                  author: 'D',
                  authorColor: AppColors.secondary,
                  likes: 95,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProjectCard({
    required String title,
    required String description,
    required List<String> tags,
    required String author,
    required Color authorColor,
    required int likes,
  }) {
    return BrutalistCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: authorColor,
                  border: Border.all(color: Colors.black, width: 3),
                ),
                alignment: Alignment.center,
                child: Text(
                  author,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.black, width: 2),
                ),
                child: const Text(
                  'FEATURED',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              height: 1.0,
            ),
          ),
          const SizedBox(height: 12),
          Container(
             decoration: const BoxDecoration(
               border: Border(left: BorderSide(color: Colors.grey, width: 4)),
             ),
             padding: const EdgeInsets.only(left: 12),
             child: Text(
               description,
               style: const TextStyle(
                 fontWeight: FontWeight.bold,
                 color: AppColors.textSecondary,
               ),
             ),
          ),
          const SizedBox(height: 20),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: tags.map((tag) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              color: Colors.black,
              child: Text(
                '#$tag',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            )).toList(),
          ),
          const SizedBox(height: 16),
          const Divider(color: Colors.black, thickness: 3),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
               Text(
                 'LIKED BY $likes',
                 style: const TextStyle(fontWeight: FontWeight.bold),
               ),
               // Static VIEW button for performance
               Container(
                 padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                 decoration: BoxDecoration(
                   color: AppColors.primary,
                   border: Border.all(color: Colors.black, width: 2),
                   boxShadow: const [
                     BoxShadow(color: Colors.black, offset: Offset(2, 2), blurRadius: 0)
                   ],
                 ),
                 child: const Text(
                   'VIEW',
                   style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
                 ),
               )
            ],
          ),
        ],
      ),
    );
  }
}
