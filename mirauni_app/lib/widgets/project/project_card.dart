import 'package:flutter/material.dart';
import '../../config/constants.dart';
import '../../models/project.dart';
import '../common/brutalist_card.dart';

/// 项目卡片组件 (Brutalist Style)
class ProjectCard extends StatelessWidget {
  final Project project;
  final VoidCallback? onTap;

  const ProjectCard({
    super.key,
    required this.project,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // Keep cards mostly white for readability, maybe just accent?
    // Let's stick to white for now, as per prototype list items

    return BrutalistCard(
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
             // Header: Author Icon + ID
             Row(
               mainAxisAlignment: MainAxisAlignment.spaceBetween,
               children: [
                 Container(
                   width: 36,
                   height: 36,
                   decoration: BoxDecoration(
                     color: AppColors.secondary, 
                     border: Border.all(color: Colors.black, width: 2),
                   ),
                   alignment: Alignment.center,
                   child: Text(
                     project.user?.displayName.substring(0, 1).toUpperCase() ?? '?',
                     style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                   ),
                 ),
                 Container(
                   padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                    color: Colors.black,
                    child: Text(
                      'ID:${project.id}',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                 ),
               ],
             ),
             
             const SizedBox(height: 12),

             // Title
             Text(
               project.title.toUpperCase(),
               style: const TextStyle(
                 fontSize: 18,
                 fontWeight: FontWeight.w900,
                 letterSpacing: -0.5,
                 decoration: TextDecoration.underline,
                 decorationThickness: 4,
                 decorationColor: AppColors.accent,
               ),
             ),
             
             const SizedBox(height: 8),

             // Description
             Container(
               padding: const EdgeInsets.only(left: 8),
               decoration: const BoxDecoration(
                 border: Border(left: BorderSide(color: Colors.grey, width: 2)),
               ),
               child: Text(
                  project.summary ?? '',
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
               ),
             ),
             
             const SizedBox(height: 16),

             // Tags
             if (project.needSkills != null)
                Wrap(
                  spacing: 4,
                  runSpacing: 4,
                  children: project.needSkills!.take(3).map((tag) => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      border: Border.all(color: Colors.black, width: 1),
                    ),
                    child: Text(
                      tag.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  )).toList(),
                ),
            
             const SizedBox(height: 16),

             // Footer Button (Static visual only to improve scrolling performance)
             Container(
               width: double.infinity,
               padding: const EdgeInsets.symmetric(vertical: 12),
               decoration: BoxDecoration(
                 color: Colors.white,
                 border: Border.all(color: Colors.black, width: 3),
                 boxShadow: const [
                   BoxShadow(
                     color: Colors.black,
                     offset: Offset(4, 4), // Static shadow
                     blurRadius: 0,
                   )
                 ],
               ),
               alignment: Alignment.center,
               child: const Text(
                 'VIEW_DETAILS',
                 style: TextStyle(
                   fontSize: 12,
                   fontWeight: FontWeight.w900,
                   color: AppColors.textPrimary,
                   letterSpacing: 0.5,
                 ),
               ),
             )
          ],
        ),
      ),
    );
  }
}
